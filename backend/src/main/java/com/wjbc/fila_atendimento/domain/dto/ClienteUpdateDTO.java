package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.domain.model.Endereco;
import com.wjbc.fila_atendimento.domain.model.Telefone;
import com.wjbc.fila_atendimento.domain.validation.CpfValido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ClienteUpdateDTO(
        @CpfValido
        String cpf,

        @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres.")
        String nome,

        @Email(message = "Formato de email inválido.")
        String email,

        List<Telefone> telefones,

        @Valid
        Endereco endereco
) {}
