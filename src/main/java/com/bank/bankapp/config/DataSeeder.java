package com.bank.bankapp.config;

import com.bank.bankapp.model.User;
import com.bank.bankapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("✅ Admin user seeded — username: admin / password: Admin@123");
        }

        if (userRepository.findByUsername("boss").isEmpty()) {
            User boss = new User();
            boss.setUsername("boss");
            boss.setPassword(passwordEncoder.encode("Boss@123"));
            boss.setRole("SUPER_ADMIN");
            userRepository.save(boss);
            System.out.println("✅ Super-admin seeded — username: boss / password: Boss@123");
        }
    }
}