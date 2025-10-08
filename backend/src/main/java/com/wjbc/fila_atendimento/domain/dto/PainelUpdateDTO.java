package com.wjbc.fila_atendimento.domain.dto;

import java.util.List;
import java.util.UUID;

public record PainelUpdateDTO(
    String descricao,
    UUID unidadeAtendimentoId,
    List<UUID> filasIds
) {}
