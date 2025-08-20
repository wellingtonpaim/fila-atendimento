package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;

import java.util.List;
import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nomeUsuario,
        String email,
        CategoriaUsuario categoria,
        List<UUID> unidadesIds) {}

