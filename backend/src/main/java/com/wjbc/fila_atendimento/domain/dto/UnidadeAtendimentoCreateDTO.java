package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.model.Endereco;
import com.wjbc.fila_atendimento.domain.model.Telefone;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UnidadeAtendimentoCreateDTO(
        @NotBlank(message = "Nome da unidade não pode ser vazio.")
        @Size(min = 3, max = 100, message = "Nome da unidade deve ter entre 3 e 100 caracteres.")
        String nome,

        @Valid
        Endereco endereco,

        @Valid
        List<Telefone> telefones
) {}
