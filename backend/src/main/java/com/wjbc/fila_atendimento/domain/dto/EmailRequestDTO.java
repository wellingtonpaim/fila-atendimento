package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmailRequestDTO {

    @NotBlank
    private String subject;

    @NotBlank
    private String body;

    @Email
    @NotBlank
    private String to;

    @Email
    @NotBlank
    private String from;
}
