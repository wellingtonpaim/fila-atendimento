package com.wjbc.fila_atendimento.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class SenhaValidator implements ConstraintValidator<SenhaValida, String> {

    private static final String REGEX =
            "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    @Override
    public boolean isValid(String senha, ConstraintValidatorContext context) {
        return senha != null && Pattern.compile(REGEX).matcher(senha).matches();
    }
}