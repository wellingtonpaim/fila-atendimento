package com.wjbc.fila_atendimento.domain.dto;

import java.time.LocalDateTime;

public record ChamadaDTO(
    String nomePaciente,
    String guicheOuSala,
    LocalDateTime dataHoraChamada
) {}
