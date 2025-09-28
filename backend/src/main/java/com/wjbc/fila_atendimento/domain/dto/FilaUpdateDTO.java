package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record FilaUpdateDTO(
        @Size(min = 3, max = 50, message = "Nome da fila deve ter entre 3 e 50 caracteres.")
        String nome,
        UUID setorId,
        UUID unidadeAtendimentoId
) {}
