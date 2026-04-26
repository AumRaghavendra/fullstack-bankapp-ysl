package com.bank.bankapp.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bank.bankapp.model.BankAccount;
import com.bank.bankapp.model.Transaction;
import com.bank.bankapp.repository.BankAccountRepository;
import com.bank.bankapp.repository.TransactionRepository;

@Service
public class BankAccountService {

    @Autowired
    BankAccountRepository bankAccountRepository;

    @Autowired
    TransactionRepository transactionRepository;

    public BankAccount createAccount(BankAccount account) {
        return bankAccountRepository.save(account);
    }

    public List<BankAccount> getAllAccounts() {
        return bankAccountRepository.findAll();
    }

    public BankAccount getAccount(String accountNumber) {
        return bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
    }

    public BankAccount deposit(String accountNumber, double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero!");
        }
        BankAccount account = getAccount(accountNumber);
        account.setBalance(account.getBalance() + amount);
        BankAccount saved = bankAccountRepository.save(account);

        transactionRepository.save(
            new Transaction(accountNumber, "DEPOSIT", amount, saved.getBalance())
        );

        return saved;
    }

    public BankAccount withdraw(String accountNumber, double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Withdrawal amount must be greater than zero!");
        }
        BankAccount account = getAccount(accountNumber);
        if (account.getBalance() < amount) {
            throw new RuntimeException("Insufficient funds!");
        }
        account.setBalance(account.getBalance() - amount);
        BankAccount saved = bankAccountRepository.save(account);

        transactionRepository.save(
            new Transaction(accountNumber, "WITHDRAW", amount, saved.getBalance())
        );

        return saved;
    }

    public String transfer(String fromAccount, String toAccount, double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero!");
        }

        // Debit the sender
        BankAccount from = getAccount(fromAccount);
        if (from.getBalance() < amount) {
            throw new RuntimeException("Insufficient funds!");
        }
        from.setBalance(from.getBalance() - amount);
        BankAccount savedFrom = bankAccountRepository.save(from);

        // Credit the receiver
        BankAccount to = getAccount(toAccount);
        to.setBalance(to.getBalance() + amount);
        BankAccount savedTo = bankAccountRepository.save(to);

        // Log exactly 2 transactions — one per side
        transactionRepository.save(
            new Transaction(fromAccount, "TRANSFER OUT", amount, savedFrom.getBalance())
        );
        transactionRepository.save(
            new Transaction(toAccount, "TRANSFER IN", amount, savedTo.getBalance())
        );

        return "Transferred " + amount + " from " + fromAccount + " to " + toAccount;
    }

    public String deleteAccount(String accountNumber) {
        BankAccount account = getAccount(accountNumber);
        bankAccountRepository.deleteById(account.getId());
        return "Account " + accountNumber + " deleted!";
    }

    public List<Transaction> getTransactionHistory(String accountNumber) {
        return transactionRepository.findByAccountNumber(accountNumber);
    }
}
