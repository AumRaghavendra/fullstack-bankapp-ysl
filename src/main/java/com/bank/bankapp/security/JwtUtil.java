package com.bank.bankapp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final Key key = Keys.hmacShaKeyFor(
        "YSLBankSuperSecretKeyThatIsLongEnough123!".getBytes()
    );

    // now accepts role and embeds it as a claim
    public String generateToken(String username, String role) {
        return Jwts.builder()
            .setSubject(username)
            .addClaims(Map.of("role", role))
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
            .signWith(key)
            .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // new — extract role directly from the token
    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}