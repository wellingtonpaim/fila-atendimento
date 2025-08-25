package com.wjbc.fila_atendimento.domain.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChamadaDTO {
    private String nomePaciente;
    private String guicheOuSala;
    private LocalDateTime dataHoraChamada;

    public ChamadaDTO(String nomePaciente, String guicheOuSala, LocalDateTime dataHoraChamada) {
        this.nomePaciente = nomePaciente;
        this.guicheOuSala = guicheOuSala;
        this.dataHoraChamada = dataHoraChamada;
    }

    public String getNomePaciente() { return nomePaciente; }
    public String getGuicheOuSala() { return guicheOuSala; }
    public LocalDateTime getDataHoraChamada() { return dataHoraChamada; }
}

