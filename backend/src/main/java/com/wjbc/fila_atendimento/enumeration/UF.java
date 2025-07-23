package com.wjbc.fila_atendimento.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

@Getter
public enum UF {
    AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO;

    @JsonCreator
    public static UF fromString(String value) {
        return UF.valueOf(value.toUpperCase());
    }
}
