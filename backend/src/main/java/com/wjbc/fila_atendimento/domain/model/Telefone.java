package com.wjbc.fila_atendimento.domain.model;

import com.wjbc.fila_atendimento.domain.enumeration.TipoTelefone;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Embeddable
public class Telefone {

    @Enumerated(EnumType.STRING)
    @NotNull
    private TipoTelefone tipo;

    @NotNull
    private int ddd;

    @NotNull
    private Long numero;
}
