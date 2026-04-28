package com.bank.bankapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.bank.bankapp.model.BankAccount;
import com.bank.bankapp.model.Transaction;
import com.bank.bankapp.repository.UserRepository;
import com.bank.bankapp.service.BankAccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/accounts")
public class BankAccountController {

    @Autowired
    BankAccountService bankAccountService;

    @Autowired
    UserRepository userRepository;

    // helper — get role of the currently logged in user from the database
    private String getRole(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .map(u -> u.getRole())
                .orElse("USER");
    }

    @PostMapping
    public ResponseEntity<BankAccount> createAccount(@Valid @RequestBody BankAccount account,
                                                     Authentication auth) {
        BankAccount created = bankAccountService.createAccount(account, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<BankAccount>> getAllAccounts(Authentication auth) {
        return ResponseEntity.ok(bankAccountService.getAllAccounts(auth.getName(), getRole(auth)));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<BankAccount> getAccount(@PathVariable String accountNumber,
                                                  Authentication auth) {
        bankAccountService.verifyOwnership(accountNumber, auth.getName(), getRole(auth));
        return ResponseEntity.ok(bankAccountService.getAccount(accountNumber));
    }

    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory(@PathVariable String accountNumber,
                                                                   Authentication auth) {
        return ResponseEntity.ok(
            bankAccountService.getTransactionHistory(accountNumber, auth.getName(), getRole(auth))
        );
    }

    @PutMapping("/{accountNumber}/deposit")
    public ResponseEntity<BankAccount> deposit(@PathVariable String accountNumber,
                                               @RequestParam double amount,
                                               Authentication auth) {
        return ResponseEntity.ok(
            bankAccountService.deposit(accountNumber, amount, auth.getName(), getRole(auth))
        );
    }

    @PutMapping("/{accountNumber}/withdraw")
    public ResponseEntity<BankAccount> withdraw(@PathVariable String accountNumber,
                                                @RequestParam double amount,
                                                Authentication auth) {
        return ResponseEntity.ok(
            bankAccountService.withdraw(accountNumber, amount, auth.getName(), getRole(auth))
        );
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestParam String fromAccount,
                                           @RequestParam String toAccount,
                                           @RequestParam double amount,
                                           Authentication auth) {
        return ResponseEntity.ok(
            bankAccountService.transfer(fromAccount, toAccount, amount, auth.getName(), getRole(auth))
        );
    }

    @DeleteMapping("/{accountNumber}")
    public ResponseEntity<String> deleteAccount(@PathVariable String accountNumber,
                                                Authentication auth) {
        return ResponseEntity.ok(
            bankAccountService.deleteAccount(accountNumber, auth.getName(), getRole(auth))
        );
    }

    // admin only endpoint — returns all registered usernames
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        if (!"ADMIN".equals(getRole(auth))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied!");
        }
        return ResponseEntity.ok(bankAccountService.getAllUsernames());
    }
}