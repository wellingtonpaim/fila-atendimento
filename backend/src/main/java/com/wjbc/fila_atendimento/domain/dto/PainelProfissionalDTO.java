package com.wjbc.fila_atendimento.domain.dto;

import java.util.List;
import java.util.UUID;

public class PainelProfissionalDTO {
    private UUID setorId;
    private List<EntradaFilaResponseDTO> filaAtual;

    public PainelProfissionalDTO(UUID setorId, List<EntradaFilaResponseDTO> filaAtual) {
        this.setorId = setorId;
        this.filaAtual = filaAtual;
    }

    public UUID getSetorId() { return setorId; }
    public List<EntradaFilaResponseDTO> getFilaAtual() { return filaAtual; }
}
