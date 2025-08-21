package com.wjbc.fila_atendimento.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PainelCreateDTO(
    @NotBlank(message = "Descrição é obrigatória")
    String descricao,
    @NotNull(message = "Unidade de atendimento é obrigatória")
    UUID unidadeAtendimentoId
) {}

