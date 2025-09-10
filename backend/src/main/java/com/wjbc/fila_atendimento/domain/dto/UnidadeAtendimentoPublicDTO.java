package com.wjbc.fila_atendimento.domain.dto;

import java.util.UUID;

/**
 * DTO público para seleção de unidades durante o login.
 * Contém apenas informações essenciais e não sensíveis.
 */
public record UnidadeAtendimentoPublicDTO(
        UUID id,
        String nome
) {}
