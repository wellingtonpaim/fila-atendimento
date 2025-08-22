package com.wjbc.fila_atendimento.domain.dashboard.dto;

import java.time.LocalDateTime;

public record HorarioPicoDTO(
    String unidadeNome,
    String setorNome,
    LocalDateTime horario,
    Long quantidadeAtendimentos
) {}

