package com.bank.bankapp.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.bank.bankapp.model.BankAccount;
import com.bank.bankapp.service.BankAccountService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/accounts")
public class BankAccountController {

    @Autowired BankAccountService bankAccountService;
    @Autowired PasswordEncoder passwordEncoder;

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .findFirst()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .orElse("USER");
    }

    private boolean isSuperAdmin(Authentication auth) {
        return "SUPER_ADMIN".equals(getRole(auth));
    }

    private boolean isAdminOrSuperAdmin(Authentication auth) {
        String role = getRole(auth);
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }

    @PostMapping
    public ResponseEntity<?> createAccount(@Valid @RequestBody BankAccount account, Authentication auth) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(bankAccountService.createAccount(account, auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<BankAccount>> getAllAccounts(Authentication auth) {
        return ResponseEntity.ok(bankAccountService.getAllAccounts(auth.getName(), getRole(auth)));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getAccount(@PathVariable String accountNumber, Authentication auth) {
        try {
            bankAccountService.verifyOwnership(accountNumber, auth.getName(), getRole(auth));
            return ResponseEntity.ok(bankAccountService.getAccount(accountNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<?> getTransactionHistory(@PathVariable String accountNumber, Authentication auth) {
        try {
            return ResponseEntity.ok(bankAccountService.getTransactionHistory(accountNumber, auth.getName(), getRole(auth)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/{accountNumber}/deposit")
    public ResponseEntity<?> deposit(@PathVariable String accountNumber,
                                     @RequestParam double amount, Authentication auth) {
        try {
            return ResponseEntity.ok(bankAccountService.deposit(accountNumber, amount, auth.getName(), getRole(auth)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{accountNumber}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable String accountNumber,
                                      @RequestParam double amount, Authentication auth) {
        try {
            return ResponseEntity.ok(bankAccountService.withdraw(accountNumber, amount, auth.getName(), getRole(auth)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestParam String fromAccount,
                                      @RequestParam String toAccount,
                                      @RequestParam double amount, Authentication auth) {
        try {
            return ResponseEntity.ok(bankAccountService.transfer(fromAccount, toAccount, amount, auth.getName(), getRole(auth)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{accountNumber}/name")
    public ResponseEntity<?> updateAccountName(@PathVariable String accountNumber,
                                               @RequestParam String newName,
                                               Authentication auth) {
        try {
            return ResponseEntity.ok(bankAccountService.updateAccountName(accountNumber, newName, auth.getName(), getRole(auth)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{accountNumber}")
    public ResponseEntity<?> deleteAccount(@PathVariable String accountNumber, Authentication auth) {
        try {
            return ResponseEntity.ok(bankAccountService.deleteAccount(accountNumber, auth.getName(), getRole(auth)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        if (!isAdminOrSuperAdmin(auth))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied!");
        return ResponseEntity.ok(bankAccountService.getAllUsernames());
    }

    @DeleteMapping("/admin/users/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username, Authentication auth) {
        if (!isSuperAdmin(auth))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied! Only super-admin can delete users.");
        if (username.equals(auth.getName()))
            return ResponseEntity.badRequest().body("You cannot delete your own account!");
        return ResponseEntity.ok(bankAccountService.deleteUser(username));
    }

    @PutMapping("/admin/users/{username}/password")
    public ResponseEntity<?> changeUserPassword(@PathVariable String username,
                                                @RequestParam String newPassword,
                                                Authentication auth) {
        if (!isSuperAdmin(auth))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied! Only super-admin can change user passwords.");
        if (!newPassword.matches(".*[A-Z].*") ||
            !newPassword.matches(".*[0-9].*") ||
            !newPassword.matches(".*[!@#$%^&*()_+\\-=\\[\\]{}|;':\\\",./<>?].*"))
            return ResponseEntity.badRequest().body("Password must contain uppercase, number, and special character!");
        return ResponseEntity.ok(bankAccountService.changeUserPassword(username, newPassword, passwordEncoder));
    }
}