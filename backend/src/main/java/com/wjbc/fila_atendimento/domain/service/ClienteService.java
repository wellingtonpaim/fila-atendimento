package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Cliente;

import java.util.List;
import java.util.UUID;

public interface ClienteService {
    ClienteResponseDTO criar(ClienteCreateDTO clienteDTO);
    ClienteResponseDTO substituir(UUID id, ClienteCreateDTO clienteDTO);
    ClienteResponseDTO atualizarParcialmente(UUID id, ClienteUpdateDTO clienteDTO);
    ClienteResponseDTO buscarPorId(UUID id);
    ClienteResponseDTO buscarPorCpf(String cpf);
    List<ClienteResponseDTO> listarTodos();
    List<ClienteResponseDTO> buscarPorNomeSemelhante(String nome);
    void desativar(UUID id);
    Cliente findClienteById(UUID id);
}