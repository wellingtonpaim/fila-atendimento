package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EntradaFilaCreateDTO(
        @NotNull(message = "ID do Cliente é obrigatório.")
        UUID clienteId,
        @NotNull(message = "ID da Fila é obrigatório.")
        UUID filaId,
        @NotNull(message = "O campo 'prioridade' é obrigatório.")
        Boolean prioridade,
        Boolean isRetorno
) {}
