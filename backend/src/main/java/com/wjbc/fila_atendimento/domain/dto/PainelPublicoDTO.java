package com.wjbc.fila_atendimento.domain.dto;

import java.util.List;
import java.util.UUID;

public record PainelPublicoDTO(
    UUID filaId,
    ChamadaDTO chamadaAtual,
    List<ChamadaDTO> ultimasChamadas,
    String mensagemVocalizacao,
    int tempoExibicao,
    int repeticoes,
    int intervaloRepeticao,
    boolean sinalizacaoSonora
) {}
