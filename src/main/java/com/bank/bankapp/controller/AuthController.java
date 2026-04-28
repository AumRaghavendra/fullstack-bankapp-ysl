package com.bank.bankapp.controller;

import com.bank.bankapp.model.User;
import com.bank.bankapp.repository.UserRepository;
import com.bank.bankapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired AuthenticationManager authManager;
    @Autowired JwtUtil jwtUtil;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {

        // check username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists!");
        }

        // check password has at least one uppercase letter
        if (!user.getPassword().matches(".*[A-Z].*")) {
            return ResponseEntity.badRequest().body("Password must contain at least one uppercase letter!");
        }

        // check password has at least one number
        if (!user.getPassword().matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body("Password must contain at least one number!");
        }

        // check password has at least one special character
        if (!user.getPassword().matches(".*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?].*")) {
            return ResponseEntity.badRequest().body("Password must contain at least one special character!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );

            // fetch role FIRST
            String role = userRepository.findByUsername(user.getUsername())
                    .map(u -> u.getRole())
                    .orElse("USER");

            // THEN generate token using the role
            String token = jwtUtil.generateToken(user.getUsername(), role);

            return ResponseEntity.ok(Map.of("token", token, "role", role));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password!");
        }
    }
}