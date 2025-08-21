package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetorCreateDTO(
        @NotBlank(message = "Nome do setor não pode ser vazio.")
        @Size(min = 3, max = 50, message = "Nome do setor deve ter entre 3 e 50 caracteres.")
        String nome
) {}
