package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record FilaCreateDTO(
        @NotBlank(message = "Nome da fila não pode ser vazio.")
        @Size(min = 3, max = 50, message = "Nome da fila deve ter entre 3 e 50 caracteres.")
        String nome,

        @NotNull(message = "ID do Setor é obrigatório.")
        UUID setorId,

        @NotNull(message = "ID da Unidade de Atendimento é obrigatório.")
        UUID unidadeAtendimentoId
) {}
