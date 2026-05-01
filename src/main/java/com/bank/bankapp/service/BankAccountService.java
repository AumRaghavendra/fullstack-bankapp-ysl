package com.bank.bankapp.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.bank.bankapp.model.BankAccount;
import com.bank.bankapp.model.Transaction;
import com.bank.bankapp.repository.BankAccountRepository;
import com.bank.bankapp.repository.TransactionRepository;
import com.bank.bankapp.repository.UserRepository;

@Service
public class BankAccountService {

    @Autowired BankAccountRepository bankAccountRepository;
    @Autowired TransactionRepository transactionRepository;
    @Autowired UserRepository userRepository;

    public BankAccount createAccount(BankAccount account, String username) {
        // global uniqueness — no two accounts can share an account number
        if (bankAccountRepository.findByAccountNumber(account.getAccountNumber()).isPresent()) {
            throw new RuntimeException("Account number " + account.getAccountNumber() + " already exists!");
        }
        account.setUsername(username);
        return bankAccountRepository.save(account);
    }

    public List<BankAccount> getAllAccounts(String username, String role) {
        if ("ADMIN".equals(role)) return bankAccountRepository.findAll();
        return bankAccountRepository.findByUsername(username);
    }

    public BankAccount getAccount(String accountNumber) {
        return bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
    }

    public void verifyOwnership(String accountNumber, String username, String role) {
        if ("ADMIN".equals(role)) return;
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
        transactionRepository.save(new Transaction(accountNumber, "DEPOSIT", amount, saved.getBalance()));
        return saved;
    }

    public BankAccount withdraw(String accountNumber, double amount, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        if (amount <= 0) throw new RuntimeException("Withdrawal amount must be greater than zero!");
        BankAccount account = getAccount(accountNumber);
        if (account.getBalance() < amount) throw new RuntimeException("Insufficient funds!");
        account.setBalance(account.getBalance() - amount);
        BankAccount saved = bankAccountRepository.save(account);
        transactionRepository.save(new Transaction(accountNumber, "WITHDRAW", amount, saved.getBalance()));
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
        transactionRepository.save(new Transaction(fromAccount, "TRANSFER OUT", amount, savedFrom.getBalance()));
        transactionRepository.save(new Transaction(toAccount, "TRANSFER IN", amount, savedTo.getBalance()));
        return "Transferred ₹" + amount + " from " + fromAccount + " to " + toAccount;
    }

    public String deleteAccount(String accountNumber, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        BankAccount account = getAccount(accountNumber);
        transactionRepository.deleteAll(transactionRepository.findByAccountNumber(accountNumber));
        bankAccountRepository.deleteById(account.getId());
        return "Account " + accountNumber + " deleted!";
    }

    public List<Transaction> getTransactionHistory(String accountNumber, String username, String role) {
        verifyOwnership(accountNumber, username, role);
        return transactionRepository.findByAccountNumber(accountNumber);
    }

    public List<String> getAllUsernames() {
        return userRepository.findAll().stream().map(u -> u.getUsername()).toList();
    }

    // admin only — delete user + all their accounts + all transactions
    public String deleteUser(String username) {
        List<BankAccount> accounts = bankAccountRepository.findByUsername(username);
        for (BankAccount account : accounts) {
            transactionRepository.deleteAll(transactionRepository.findByAccountNumber(account.getAccountNumber()));
        }
        bankAccountRepository.deleteAll(accounts);
        userRepository.findByUsername(username).ifPresent(u -> userRepository.delete(u));
        return "User " + username + " and all their data deleted!";
    }

    // admin only — reset a user's password
    public String changeUserPassword(String username, String newPassword, PasswordEncoder passwordEncoder) {
        return userRepository.findByUsername(username).map(u -> {
            u.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(u);
            return "Password updated for " + username;
        }).orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}