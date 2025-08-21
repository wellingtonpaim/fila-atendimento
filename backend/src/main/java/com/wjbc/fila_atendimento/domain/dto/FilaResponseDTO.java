package com.wjbc.fila_atendimento.domain.dto;

import java.util.UUID;

public record FilaResponseDTO(
        UUID id,
        String nome,
        SetorResponseDTO setor,
        UnidadeAtendimentoResponseDTO unidade
) {}
