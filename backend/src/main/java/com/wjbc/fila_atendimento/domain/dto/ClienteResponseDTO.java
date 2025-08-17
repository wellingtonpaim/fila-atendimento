package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.model.Endereco;
import com.wjbc.fila_atendimento.domain.model.Telefone;

import java.util.List;
import java.util.UUID;

public record ClienteResponseDTO(
        UUID id,
        String cpf,
        String nome,
        String email,
        List<Telefone> telefones,
        Endereco endereco
) {}
