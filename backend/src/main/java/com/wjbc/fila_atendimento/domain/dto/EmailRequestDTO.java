package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailRequestDTO(
    @NotBlank String subject,
    @NotBlank String body,
    @Email @NotBlank String to,
    @Email @NotBlank String from
) {}
