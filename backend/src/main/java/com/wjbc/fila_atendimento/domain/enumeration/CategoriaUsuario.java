package com.wjbc.fila_atendimento.domain.enumeration;

import lombok.Getter;

@Getter
public enum CategoriaUsuario {
    ADMINISTRADOR("ROLE_ADMINISTRADOR"),
    USUARIO("ROLE_USUARIO");

    private final String role;

    CategoriaUsuario(String role) {
        this.role = role;
    }

}
