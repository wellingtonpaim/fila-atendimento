package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record UsuarioUpdateDTO(
        @Size(min = 3) String nomeUsuario,
        @Email String email,
        @NotNull CategoriaUsuario categoria,
        List<UUID> unidadesIds
) {}
