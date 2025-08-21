package com.wjbc.fila_atendimento.domain.dto;

import java.util.UUID;

public record PainelResponseDTO(
    UUID id,
    String descricao,
    UUID unidadeAtendimentoId
) {}

