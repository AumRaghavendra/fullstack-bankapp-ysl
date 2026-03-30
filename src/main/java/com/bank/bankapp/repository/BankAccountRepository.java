package com.bank.bankapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bank.bankapp.model.BankAccount;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Integer> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);

}