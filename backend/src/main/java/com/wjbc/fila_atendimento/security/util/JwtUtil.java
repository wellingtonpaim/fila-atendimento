package com.wjbc.fila_atendimento.security.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.wjbc.fila_atendimento.security.enums.SECURITY_CONSTANTS;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    public String getUsernameFromToken(String token) {
        try {
            return JWT.require(Algorithm.HMAC512(SECURITY_CONSTANTS.SECRET.getBytes()))
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            throw new IllegalArgumentException("Invalid JWT token");
        }
    }
}

