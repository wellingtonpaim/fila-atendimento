package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Cliente;
import com.wjbc.fila_atendimento.domain.repository.ClienteRepository;
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

    private AutoCloseable mocks;

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() throws Exception {
        if (mocks != null) {
            mocks.close();
        }
    }

    @Test void criarCliente_sucesso() {
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente cliente = new Cliente(); cliente.setId(UUID.randomUUID()); cliente.setCpf(dto.cpf()); cliente.setNome(dto.nome()); cliente.setEmail(dto.email());
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(cliente.getId(), cliente.getCpf(), cliente.getNome(), cliente.getEmail(), null, null);
        // Mock do mapeamento DTO -> Model
        when(clienteMapper.toEntity(dto)).thenReturn(cliente);
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
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(cliente.getId(), cliente.getCpf(), cliente.getNome(), cliente.getEmail(), null, null);
        when(clienteRepository.findByCpf(cpf)).thenReturn(Optional.of(cliente));
        when(clienteMapper.toResponseDTO(cliente)).thenReturn(responseDTO);
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
        assertEquals(nome, result.getFirst().nome());
    }

    @Test void listarTodos_sucesso() {
        Cliente cliente1 = new Cliente(); cliente1.setId(UUID.randomUUID()); cliente1.setCpf("12345678900"); cliente1.setNome("Nome1"); cliente1.setEmail("email1@email.com");
        Cliente cliente2 = new Cliente(); cliente2.setId(UUID.randomUUID()); cliente2.setCpf("12345678901"); cliente2.setNome("Nome2"); cliente2.setEmail("email2@email.com");
        when(clienteRepository.findAll()).thenReturn(java.util.List.of(cliente1, cliente2));
        java.util.List<ClienteResponseDTO> result = service.listarTodos();
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test void substituirCliente_sucesso() {
        UUID id = UUID.randomUUID();
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Novo Nome", "novo@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setNome("Nome"); clienteExistente.setEmail("email@email.com");
        Cliente clienteAtualizado = new Cliente(); clienteAtualizado.setId(id); clienteAtualizado.setCpf(dto.cpf()); clienteAtualizado.setNome(dto.nome()); clienteAtualizado.setEmail(dto.email());
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(clienteAtualizado.getId(), clienteAtualizado.getCpf(), clienteAtualizado.getNome(), clienteAtualizado.getEmail(), null, null);
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.save(any())).thenReturn(clienteAtualizado);
        when(clienteMapper.toResponseDTO(clienteAtualizado)).thenReturn(responseDTO);
        ClienteResponseDTO result = service.substituir(id, dto);
        assertNotNull(result);
        assertEquals(dto.nome(), result.nome());
    }

    @Test void buscarPorId_sucesso() {
        UUID id = UUID.randomUUID();
        Cliente cliente = new Cliente(); cliente.setId(id); cliente.setCpf("12345678900"); cliente.setNome("Nome"); cliente.setEmail("email@email.com");
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(cliente.getId(), cliente.getCpf(), cliente.getNome(), cliente.getEmail(), null, null);
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));
        when(clienteMapper.toResponseDTO(cliente)).thenReturn(responseDTO);
        ClienteResponseDTO result = service.buscarPorId(id);
        assertNotNull(result);
        assertEquals("Nome", result.nome());
    }

    @Test void desativarCliente_naoEncontrado() {
        UUID id = UUID.randomUUID();
        when(clienteRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.desativar(id));
    }

    @Test void criarCliente_cpfDuplicado() {
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(UUID.randomUUID()); clienteExistente.setCpf(dto.cpf()); clienteExistente.setEmail("outro@email.com");
        when(clienteRepository.findByCpf(dto.cpf())).thenReturn(Optional.of(clienteExistente));
        assertThrows(RuntimeException.class, () -> service.criar(dto));
    }

    @Test void criarCliente_emailDuplicado() {
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(UUID.randomUUID()); clienteExistente.setCpf("99999999999"); clienteExistente.setEmail(dto.email());
        when(clienteRepository.findByCpf(dto.cpf())).thenReturn(Optional.empty());
        when(clienteRepository.findByEmail(dto.email())).thenReturn(Optional.of(clienteExistente));
        assertThrows(RuntimeException.class, () -> service.criar(dto));
    }

    @Test void atualizarParcialmente_cpfDuplicadoOutroCliente() {
        UUID id = UUID.randomUUID();
        ClienteUpdateDTO dto = new ClienteUpdateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setEmail("email@email.com");
        Cliente clienteOutro = new Cliente(); clienteOutro.setId(UUID.randomUUID()); clienteOutro.setCpf("12345678900");
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByCpf("12345678900")).thenReturn(Optional.of(clienteOutro));
        when(clienteRepository.findByEmail("email@email.com")).thenReturn(Optional.empty());
        doNothing().when(clienteMapper).applyPatchToEntity(eq(dto), eq(clienteExistente));
        assertThrows(RuntimeException.class, () -> service.atualizarParcialmente(id, dto));
    }

    @Test void atualizarParcialmente_emailDuplicadoOutroCliente() {
        UUID id = UUID.randomUUID();
        ClienteUpdateDTO dto = new ClienteUpdateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setEmail("email@email.com");
        Cliente clienteOutro = new Cliente(); clienteOutro.setId(UUID.randomUUID()); clienteOutro.setEmail("email@email.com");
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByCpf("12345678900")).thenReturn(Optional.empty());
        when(clienteRepository.findByEmail("email@email.com")).thenReturn(Optional.of(clienteOutro));
        doNothing().when(clienteMapper).applyPatchToEntity(eq(dto), eq(clienteExistente));
        assertThrows(RuntimeException.class, () -> service.atualizarParcialmente(id, dto));
    }

    @Test void substituirCliente_cpfDuplicadoOutroCliente() {
        UUID id = UUID.randomUUID();
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setEmail("email@email.com");
        Cliente clienteOutro = new Cliente(); clienteOutro.setId(UUID.randomUUID()); clienteOutro.setCpf("12345678900");
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByCpf("12345678900")).thenReturn(Optional.of(clienteOutro));
        when(clienteRepository.findByEmail("email@email.com")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.substituir(id, dto));
    }

    @Test void substituirCliente_emailDuplicadoOutroCliente() {
        UUID id = UUID.randomUUID();
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setEmail("email@email.com");
        Cliente clienteOutro = new Cliente(); clienteOutro.setId(UUID.randomUUID()); clienteOutro.setEmail("email@email.com");
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByCpf("12345678900")).thenReturn(Optional.empty());
        when(clienteRepository.findByEmail("email@email.com")).thenReturn(Optional.of(clienteOutro));
        assertThrows(RuntimeException.class, () -> service.substituir(id, dto));
    }

    @Test void listarTodos_listaVazia() {
        when(clienteRepository.findAll()).thenReturn(new ArrayList<>());
        java.util.List<ClienteResponseDTO> result = service.listarTodos();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test void buscarPorNomeSemelhante_vazio() {
        when(clienteRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class))).thenReturn(new ArrayList<>());
        java.util.List<ClienteResponseDTO> result = service.buscarPorNomeSemelhante("Inexistente");
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test void atualizarParcialmente_cpfEmailMesmoCliente_naoLancaExcecao() {
        UUID id = UUID.randomUUID();
        ClienteUpdateDTO dto = new ClienteUpdateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setEmail("email@email.com");
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByCpf("12345678900")).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByEmail("email@email.com")).thenReturn(Optional.of(clienteExistente));
        doNothing().when(clienteMapper).applyPatchToEntity(eq(dto), eq(clienteExistente));
        when(clienteRepository.save(any())).thenReturn(clienteExistente);
        when(clienteMapper.toResponseDTO(clienteExistente)).thenReturn(new ClienteResponseDTO(id, "12345678900", "Nome", "email@email.com", null, null));
        assertDoesNotThrow(() -> service.atualizarParcialmente(id, dto));
    }

    @Test void substituirCliente_cpfEmailMesmoCliente_naoLancaExcecao() {
        UUID id = UUID.randomUUID();
        ClienteCreateDTO dto = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<>(), null);
        Cliente clienteExistente = new Cliente(); clienteExistente.setId(id); clienteExistente.setCpf("12345678900"); clienteExistente.setEmail("email@email.com");
        when(clienteRepository.findById(id)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByCpf("12345678900")).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.findByEmail("email@email.com")).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.save(any())).thenReturn(clienteExistente);
        when(clienteMapper.toResponseDTO(clienteExistente)).thenReturn(new ClienteResponseDTO(id, "12345678900", "Nome", "email@email.com", null, null));
        assertDoesNotThrow(() -> service.substituir(id, dto));
    }
}
