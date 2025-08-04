package com.wjbc.fila_atendimento.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

@Getter
public enum StatusFila {
    AGUARDANDO,
    CHAMADO,
    ATENDIDO,
    CANCELADO;

    @JsonCreator
    public static StatusFila fromString(String value) {return StatusFila.valueOf(value.toUpperCase());}
}