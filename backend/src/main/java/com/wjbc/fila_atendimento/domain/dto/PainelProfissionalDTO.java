package com.wjbc.fila_atendimento.domain.dto;

import java.util.List;
import java.util.UUID;

public record PainelProfissionalDTO(UUID setorId, List<EntradaFilaResponseDTO> filaAtual) {}
