package com.wjbc.fila_atendimento.domain.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfCnpjValidator implements ConstraintValidator<CpfCnpj, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }

        String numeric = value.replaceAll("[^\\d]", "");

        if (numeric.length() == 11) {
            return isValidCPF(numeric);
        } else if (numeric.length() == 14) {
            return isValidCNPJ(numeric);
        }

        return false;
    }

    private boolean isValidCPF(String cpf) {
        if (cpf.chars().distinct().count() == 1) return false; // todos dígitos iguais (tipo 111.111.111-11)

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += (cpf.charAt(i) - '0') * (10 - i);
        }
        int digit1 = 11 - (sum % 11);
        if (digit1 >= 10) digit1 = 0;

        if (digit1 != (cpf.charAt(9) - '0')) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += (cpf.charAt(i) - '0') * (11 - i);
        }
        int digit2 = 11 - (sum % 11);
        if (digit2 >= 10) digit2 = 0;

        return digit2 == (cpf.charAt(10) - '0');
    }

    private boolean isValidCNPJ(String cnpj) {
        if (cnpj.chars().distinct().count() == 1) return false; // todos dígitos iguais (tipo 11.111.111/1111-11)

        int[] weight1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] weight2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < 12; i++) {
            sum += (cnpj.charAt(i) - '0') * weight1[i];
        }
        int digit1 = sum % 11;
        digit1 = (digit1 < 2) ? 0 : 11 - digit1;

        if (digit1 != (cnpj.charAt(12) - '0')) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 13; i++) {
            sum += (cnpj.charAt(i) - '0') * weight2[i];
        }
        int digit2 = sum % 11;
        digit2 = (digit2 < 2) ? 0 : 11 - digit2;

        return digit2 == (cnpj.charAt(13) - '0');
    }
}
