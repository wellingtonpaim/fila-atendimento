package com.wjbc.fila_atendimento.domain.dashboard.dto;

public record FluxoPacientesDTO(
    String unidadeNome,
    String setorOrigem,
    String setorDestino,
    Long quantidadePacientes
) {}

