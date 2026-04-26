package com.bank.bankapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bank.bankapp.model.BankAccount;
import com.bank.bankapp.model.Transaction;
import com.bank.bankapp.service.BankAccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/accounts")
public class BankAccountController {

    @Autowired
    BankAccountService bankAccountService;

    @PostMapping
    public ResponseEntity<BankAccount> createAccount(@Valid @RequestBody BankAccount account) {
        BankAccount created = bankAccountService.createAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<BankAccount>> getAllAccounts() {
        return ResponseEntity.ok(bankAccountService.getAllAccounts());
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<BankAccount> getAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(bankAccountService.getAccount(accountNumber));
    }
    
    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory(@PathVariable String accountNumber) {
        return ResponseEntity.ok(bankAccountService.getTransactionHistory(accountNumber));
    }

    @PutMapping("/{accountNumber}/deposit")
    public ResponseEntity<BankAccount> deposit(@PathVariable String accountNumber,
                                               @RequestParam double amount) {
        return ResponseEntity.ok(bankAccountService.deposit(accountNumber, amount));
    }

    @PutMapping("/{accountNumber}/withdraw")
    public ResponseEntity<BankAccount> withdraw(@PathVariable String accountNumber,
                                                @RequestParam double amount) {
        return ResponseEntity.ok(bankAccountService.withdraw(accountNumber, amount));
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestParam String fromAccount,
                                           @RequestParam String toAccount,
                                           @RequestParam double amount) {
        return ResponseEntity.ok(bankAccountService.transfer(fromAccount, toAccount, amount));
    }

    @DeleteMapping("/{accountNumber}")
    public ResponseEntity<String> deleteAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(bankAccountService.deleteAccount(accountNumber));
    }
}