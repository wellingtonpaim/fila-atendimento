package com.wjbc.fila_atendimento.domain.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

@Getter
public enum TipoTelefone {
    FIXO, CELULAR;

    @JsonCreator
    public static TipoTelefone fromString(String value) {
        return TipoTelefone.valueOf(value.toUpperCase());
    }
}
