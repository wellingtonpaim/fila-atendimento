package com.wjbc.fila_atendimento.security.util;

import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordUtils {

    private PasswordUtils() {

    }

    public static boolean isBCryptEncoded(String senha) {
        if (senha == null) {
            return false;
        }
        return senha.startsWith("$2a$") || senha.startsWith("$2b$") || senha.startsWith("$2y$");
    }

    public static String encodeIfNeeded(String senha, PasswordEncoder encoder) {
        if (senha == null) {
            return null;
        }
        if (isBCryptEncoded(senha)) {
            return senha; // Já está codificada, retorna como está
        }
        return encoder.encode(senha); // Se não, codifica
    }
}
