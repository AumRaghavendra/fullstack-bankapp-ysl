package com.bank.bankapp.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bank.bankapp.model.BankAccount;
import com.bank.bankapp.model.Transaction;
import com.bank.bankapp.repository.BankAccountRepository;
import com.bank.bankapp.repository.TransactionRepository;
import com.bank.bankapp.repository.UserRepository;

@Service
public class BankAccountService {

    @Autowired
    BankAccountRepository bankAccountRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    UserRepository userRepository;

    // stamp the requesting user's username onto the account before saving
    public BankAccount createAccount(BankAccount account, String username) {
        account.setUsername(username);
        return bankAccountRepository.save(account);
    }

    // admin gets all accounts, user gets only their own
    public List<BankAccount> getAllAccounts(String username, String role) {
        if ("ADMIN".equals(role)) {
            return bankAccountRepository.findAll();
        }
        return bankAccountRepository.findByUsername(username);
    }

    public BankAccount getAccount(String accountNumber) {
        return bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
    }

    // check that the requesting user actually owns the account before allowing operations
    public void verifyOwnership(String accountNumber, String username, String role) {
        if ("ADMIN".equals(role)) return; // admin can operate on anything
        BankAccount account = getAccount(accountNumber);
        if (!account.getUsername().equals(username)) {
            throw new RuntimeException("Access denied — this account does not belong to you!");
        }
    }

    public BankAccount deposit(String accountNumber, double amount, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        if (amount <= 0) throw new RuntimeException("Deposit amount must be greater than zero!");

        BankAccount account = getAccount(accountNumber);
        account.setBalance(account.getBalance() + amount);
        BankAccount saved = bankAccountRepository.save(account);

        transactionRepository.save(
            new Transaction(accountNumber, "DEPOSIT", amount, saved.getBalance())
        );
        return saved;
    }

    public BankAccount withdraw(String accountNumber, double amount, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        if (amount <= 0) throw new RuntimeException("Withdrawal amount must be greater than zero!");

        BankAccount account = getAccount(accountNumber);
        if (account.getBalance() < amount) throw new RuntimeException("Insufficient funds!");

        account.setBalance(account.getBalance() - amount);
        BankAccount saved = bankAccountRepository.save(account);

        transactionRepository.save(
            new Transaction(accountNumber, "WITHDRAW", amount, saved.getBalance())
        );
        return saved;
    }

    public String transfer(String fromAccount, String toAccount, double amount, String username, String role) {
        verifyOwnership(fromAccount, username, role);
        if (amount <= 0) throw new RuntimeException("Transfer amount must be greater than zero!");

        BankAccount from = getAccount(fromAccount);
        if (from.getBalance() < amount) throw new RuntimeException("Insufficient funds!");
        from.setBalance(from.getBalance() - amount);
        BankAccount savedFrom = bankAccountRepository.save(from);

        BankAccount to = getAccount(toAccount);
        to.setBalance(to.getBalance() + amount);
        BankAccount savedTo = bankAccountRepository.save(to);

        // log exactly 2 transactions — one per side
        transactionRepository.save(
            new Transaction(fromAccount, "TRANSFER OUT", amount, savedFrom.getBalance())
        );
        transactionRepository.save(
            new Transaction(toAccount, "TRANSFER IN", amount, savedTo.getBalance())
        );

        return "Transferred " + amount + " from " + fromAccount + " to " + toAccount;
    }

    public String deleteAccount(String accountNumber, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        BankAccount account = getAccount(accountNumber);
        bankAccountRepository.deleteById(account.getId());
        return "Account " + accountNumber + " deleted!";
    }

    public List<Transaction> getTransactionHistory(String accountNumber, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        return transactionRepository.findByAccountNumber(accountNumber);
    }

    // admin only — get all registered usernames
    public List<String> getAllUsernames() {
        return userRepository.findAll()
                .stream()
                .map(u -> u.getUsername())
                .toList();
    }
}