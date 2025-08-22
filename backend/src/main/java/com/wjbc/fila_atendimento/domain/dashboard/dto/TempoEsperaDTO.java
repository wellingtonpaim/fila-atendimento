package com.wjbc.fila_atendimento.domain.dashboard.dto;

import java.time.LocalDateTime;

public record TempoEsperaDTO(
    String filaNome,
    String setorNome,
    String unidadeNome,
    Double tempoMedioEsperaMinutos,
    LocalDateTime periodoInicio,
    LocalDateTime periodoFim
) {}

