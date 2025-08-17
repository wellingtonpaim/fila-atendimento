package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteCreateDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setCpf(dto.cpf());
        cliente.setNome(dto.nome());
        cliente.setEmail(dto.email());
        cliente.setTelefones(dto.telefones());
        cliente.setEndereco(dto.endereco());
        return cliente;
    }

    public ClienteResponseDTO toResponseDTO(Cliente cliente) {
        return new ClienteResponseDTO(
                cliente.getId(),
                cliente.getCpf(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getTelefones(),
                cliente.getEndereco()
        );
    }

    public void applyPatchToEntity(ClienteUpdateDTO dto, Cliente cliente) {
        if (dto.cpf() != null) {
            cliente.setCpf(dto.cpf());
        }
        if (dto.nome() != null) {
            cliente.setNome(dto.nome());
        }
        if (dto.email() != null) {
            cliente.setEmail(dto.email());
        }
        if (dto.telefones() != null) {
            cliente.setTelefones(dto.telefones());
        }
        if (dto.endereco() != null) {
            cliente.setEndereco(dto.endereco());
        }
    }
}