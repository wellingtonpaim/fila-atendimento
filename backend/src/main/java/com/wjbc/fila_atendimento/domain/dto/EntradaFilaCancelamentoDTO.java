package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.Size;

public record EntradaFilaCancelamentoDTO(
        @Size(max = 500, message = "motivoCancelamento deve ter no máximo 500 caracteres")
        String motivoCancelamento
) {}

