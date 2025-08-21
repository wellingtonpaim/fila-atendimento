package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.validation.SenhaValida;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record UsuarioCreateDTO(
        @NotBlank String nomeUsuario,
        @NotBlank @Email String email,
        @NotBlank @SenhaValida String senha,
        @NotNull CategoriaUsuario categoria,
        List<UUID> unidadesIds
) {}
