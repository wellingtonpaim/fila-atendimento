package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.validation.SenhaValida;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequestDTO(
        @NotBlank String token,
        @NotBlank @SenhaValida String novaSenha
) {}

