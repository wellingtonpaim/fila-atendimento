package com.wjbc.fila_atendimento.domain.dashboard.dto;

public record ProdutividadeDTO(
    String profissionalNome,
    String setorNome,
    String unidadeNome,
    Long atendimentosRealizados,
    Double tempoMedioAtendimentoMinutos
) {}

