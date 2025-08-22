package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Cliente;
import com.wjbc.fila_atendimento.domain.repository.ClienteRepository;
import com.wjbc.fila_atendimento.domain.service.impl.ClienteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClienteServiceImplTest {
    @Mock ClienteRepository clienteRepository;
    @Mock com.wjbc.fila_atendimento.domain.mapper.ClienteMapper clienteMapper;
    @InjectMocks ClienteServiceImpl service;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void criarCliente_sucesso() {
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente cliente = new Cliente(); cliente.setId(UUID.randomUUID()); cliente.setCpf(dto.cpf()); cliente.setNome(dto.nome()); cliente.setEmail(dto.email());
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(cliente.getId(), cliente.getCpf(), cliente.getNome(), cliente.getEmail(), null, null);
        when(clienteRepository.save(any())).thenReturn(cliente);
        when(clienteMapper.toResponseDTO(cliente)).thenReturn(responseDTO);
        ClienteResponseDTO result = service.criar(dto);
        assertNotNull(result);
        assertEquals(dto.cpf(), result.cpf());
    }

    @Test void buscarPorId_clienteNaoExiste() {
        UUID id = UUID.randomUUID();
        when(clienteRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.buscarPorId(id));
    }

    @Test void atualizarCliente_sucesso() {
        UUID id = UUID.randomUUID();
        ClienteUpdateDTO dto = new ClienteUpdateDTO("12345678900", "Novo Nome", "novo@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setNome("Nome"); clienteExistente.setEmail("email@email.com");
        Cliente clienteAtualizado = new Cliente(); clienteAtualizado.setId(id); clienteAtualizado.setCpf(dto.cpf()); clienteAtualizado.setNome(dto.nome()); clienteAtualizado.setEmail(dto.email());
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(clienteAtualizado.getId(), clienteAtualizado.getCpf(), clienteAtualizado.getNome(), clienteAtualizado.getEmail(), null, null);
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.save(any())).thenReturn(clienteAtualizado);
        when(clienteMapper.toResponseDTO(clienteAtualizado)).thenReturn(responseDTO);
        ClienteResponseDTO result = service.atualizarParcialmente(id, dto);
        assertNotNull(result);
        assertEquals(dto.nome(), result.nome());
    }

    @Test void buscarPorCpf_sucesso() {
        String cpf = "12345678900";
        Cliente cliente = new Cliente(); cliente.setId(UUID.randomUUID()); cliente.setCpf(cpf); cliente.setNome("Nome"); cliente.setEmail("email@email.com");
        when(clienteRepository.findByCpf(cpf)).thenReturn(Optional.of(cliente));
        ClienteResponseDTO result = service.buscarPorCpf(cpf);
        assertNotNull(result);
        assertEquals(cpf, result.cpf());
    }

    @Test void buscarPorCpf_clienteNaoExiste() {
        String cpf = "12345678900";
        when(clienteRepository.findByCpf(cpf)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.buscarPorCpf(cpf));
    }

    @Test void desativarCliente_sucesso() {
        UUID id = UUID.randomUUID();
        Cliente cliente = new Cliente(); cliente.setId(id);
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));
        doNothing().when(clienteRepository).delete(cliente);
        assertDoesNotThrow(() -> service.desativar(id));
    }

    @Test void buscarPorNomeSemelhante_sucesso() {
        String nome = "Nome";
        Cliente cliente = new Cliente(); cliente.setId(UUID.randomUUID()); cliente.setCpf("12345678900"); cliente.setNome(nome); cliente.setEmail("email@email.com");
        ClienteResponseDTO clienteResponseDTO = new ClienteResponseDTO(cliente.getId(), cliente.getCpf(), cliente.getNome(), cliente.getEmail(), null, null);
        // Corrigindo o warning de Specification
        when(clienteRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class))).thenReturn(java.util.List.of(cliente));
        when(clienteMapper.toResponseDTO(any(Cliente.class))).thenReturn(clienteResponseDTO);
        java.util.List<ClienteResponseDTO> result = service.buscarPorNomeSemelhante(nome);
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(nome, result.get(0).nome());
    }

    @Test void listarTodos_sucesso() {
        Cliente cliente1 = new Cliente(); cliente1.setId(UUID.randomUUID()); cliente1.setCpf("12345678900"); cliente1.setNome("Nome1"); cliente1.setEmail("email1@email.com");
        Cliente cliente2 = new Cliente(); cliente2.setId(UUID.randomUUID()); cliente2.setCpf("12345678901"); cliente2.setNome("Nome2"); cliente2.setEmail("email2@email.com");
        when(clienteRepository.findAll()).thenReturn(java.util.List.of(cliente1, cliente2));
        java.util.List<ClienteResponseDTO> result = service.listarTodos();
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    // Outros testes para buscarPorCpf, desativar podem ser implementados aqui
}
