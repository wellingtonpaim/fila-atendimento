package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;

import java.time.LocalDateTime;
import java.util.UUID;

public record EntradaFilaResponseDTO(
        UUID id,
        StatusFila status,
        boolean prioridade,
        boolean isRetorno,
        LocalDateTime dataHoraEntrada,
        LocalDateTime dataHoraChamada,
        LocalDateTime dataHoraSaida,
        String guicheOuSalaAtendimento,
        ClienteResponseDTO cliente,
        FilaResponseDTO fila,
        UUID usuarioResponsavelId
) {}
