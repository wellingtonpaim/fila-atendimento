package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.service.ClienteService;
import com.wjbc.fila_atendimento.domain.model.Telefone;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClienteControllerTest {
    @Mock
    private ClienteService clienteService;
    @InjectMocks
    private ClienteController clienteController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void listarTodos_sucesso() {
        ClienteResponseDTO dto = new ClienteResponseDTO(UUID.randomUUID(), "12345678900", "Nome", "email@email.com", null, null);
        when(clienteService.listarTodos()).thenReturn(List.of(dto));
        ResponseEntity<List<ClienteResponseDTO>> response = clienteController.listarTodos();
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isEmpty());
    }

    @Test
    void buscarPorId_sucesso() {
        UUID id = UUID.randomUUID();
        ClienteResponseDTO dto = new ClienteResponseDTO(id, "12345678900", "Nome", "email@email.com", null, null);
        when(clienteService.buscarPorId(id)).thenReturn(dto);
        ResponseEntity<ClienteResponseDTO> response = clienteController.buscarPorId(id);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().id());
    }

    @Test
    void buscarPorCpf_sucesso() {
        String cpf = "12345678900";
        ClienteResponseDTO dto = new ClienteResponseDTO(UUID.randomUUID(), cpf, "Nome", "email@email.com", null, null);
        when(clienteService.buscarPorCpf(cpf)).thenReturn(dto);
        ResponseEntity<ClienteResponseDTO> response = clienteController.buscarPorCpf(cpf);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(cpf, response.getBody().cpf());
    }

    @Test
    void buscarPorNomeSemelhante_sucesso() {
        String nome = "Nome";
        ClienteResponseDTO dto = new ClienteResponseDTO(UUID.randomUUID(), "12345678900", nome, "email@email.com", null, null);
        when(clienteService.buscarPorNomeSemelhante(nome)).thenReturn(List.of(dto));
        ResponseEntity<List<ClienteResponseDTO>> response = clienteController.buscarPorNomeSemelhante(nome);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isEmpty());
        assertEquals(nome, response.getBody().get(0).nome());
    }

    @Test
    void criar_sucesso() {
        ClienteCreateDTO createDTO = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<Telefone>(), null);
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(UUID.randomUUID(), "12345678900", "Nome", "email@email.com", null, null);
        when(clienteService.criar(createDTO)).thenReturn(responseDTO);
        ResponseEntity<ClienteResponseDTO> response = clienteController.criar(createDTO);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Nome", response.getBody().nome());
    }

    @Test
    void substituir_sucesso() {
        UUID id = UUID.randomUUID();
        ClienteCreateDTO createDTO = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<Telefone>(), null);
        ClienteResponseDTO responseDTO = new ClienteResponseDTO(id, "12345678900", "Nome", "email@email.com", null, null);
        when(clienteService.substituir(id, createDTO)).thenReturn(responseDTO);
        ResponseEntity<ClienteResponseDTO> response = clienteController.substituir(id, createDTO);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().id());
    }

    @Test
    void buscarPorId_naoEncontrado() {
        UUID id = UUID.randomUUID();
        when(clienteService.buscarPorId(id)).thenThrow(new RuntimeException("Cliente não encontrado"));
        Exception exception = assertThrows(RuntimeException.class, () -> clienteController.buscarPorId(id));
        assertEquals("Cliente não encontrado", exception.getMessage());
    }

    @Test
    void buscarPorCpf_naoEncontrado() {
        String cpf = "00000000000";
        when(clienteService.buscarPorCpf(cpf)).thenThrow(new RuntimeException("Cliente não encontrado"));
        Exception exception = assertThrows(RuntimeException.class, () -> clienteController.buscarPorCpf(cpf));
        assertEquals("Cliente não encontrado", exception.getMessage());
    }

    @Test
    void criar_dadosInvalidos() {
        ClienteCreateDTO createDTO = new ClienteCreateDTO("", "", "", new ArrayList<Telefone>(), null);
        when(clienteService.criar(createDTO)).thenThrow(new IllegalArgumentException("Dados inválidos"));
        Exception exception = assertThrows(IllegalArgumentException.class, () -> clienteController.criar(createDTO));
        assertEquals("Dados inválidos", exception.getMessage());
    }

    @Test
    void criar_emailDuplicado() {
        ClienteCreateDTO createDTO = new ClienteCreateDTO("12345678900", "Nome", "email@email.com", new ArrayList<Telefone>(), null);
        when(clienteService.criar(createDTO)).thenThrow(new com.wjbc.fila_atendimento.exception.EmailDuplicadoException("Email email@email.com já cadastrado no sistema."));
        try {
            clienteController.criar(createDTO);
            fail("Deveria lançar EmailDuplicadoException");
        } catch (com.wjbc.fila_atendimento.exception.EmailDuplicadoException ex) {
            assertEquals("Email email@email.com já cadastrado no sistema.", ex.getMessage());
        }
    }
}
