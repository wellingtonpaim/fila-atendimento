package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.EntradaFilaMapper;
import com.wjbc.fila_atendimento.domain.model.Cliente;
import com.wjbc.fila_atendimento.domain.model.EntradaFila;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.repository.EntradaFilaRepository;
import com.wjbc.fila_atendimento.domain.service.impl.EntradaFilaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EntradaFilaServiceImplTest {
    @Mock EntradaFilaRepository entradaFilaRepository;
    @Mock EntradaFilaMapper entradaFilaMapper;
    @Mock ClienteService clienteService;
    @Mock FilaService filaService;
    @Mock UsuarioService usuarioService;
    @InjectMocks EntradaFilaServiceImpl service;

    @BeforeEach void setUp() {
        AutoCloseable mocks = MockitoAnnotations.openMocks(this);
    }

    private EntradaFilaResponseDTO mockResponseDTO() {
        return new EntradaFilaResponseDTO(
            UUID.randomUUID(), StatusFila.AGUARDANDO, false, false,
            null, null, null, "A1",
            null, null, UUID.randomUUID()
        );
    }

    @Test void adicionarClienteAFila_sucesso() {
        UUID clienteId = UUID.randomUUID();
        UUID filaId = UUID.randomUUID();
        EntradaFilaCreateDTO dto = new EntradaFilaCreateDTO(clienteId, filaId, false, false);
        Cliente cliente = new Cliente(); cliente.setId(clienteId);
        Fila fila = new Fila(); fila.setId(filaId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setCliente(cliente); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        when(clienteService.findClienteById(clienteId)).thenReturn(cliente);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, fila, StatusFila.AGUARDANDO)).thenReturn(false);
        when(entradaFilaRepository.save(any())).thenReturn(entrada);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.adicionarClienteAFila(dto);
        assertNotNull(result);
    }

    @Test void adicionarClienteAFila_clienteJaAguardando() {
        UUID clienteId = UUID.randomUUID();
        UUID filaId = UUID.randomUUID();
        EntradaFilaCreateDTO dto = new EntradaFilaCreateDTO(clienteId, filaId, false, false);
        Cliente cliente = new Cliente(); cliente.setId(clienteId);
        Fila fila = new Fila(); fila.setId(filaId);
        when(clienteService.findClienteById(clienteId)).thenReturn(cliente);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, fila, StatusFila.AGUARDANDO)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.adicionarClienteAFila(dto));
    }

    @Test void chamarProximo_sucesso() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, false)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(chamado);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.chamarProximo(filaId, usuarioId, guiche);
        assertNotNull(result);
    }

    @Test void chamarProximo_filaVazia() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, false)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.chamarProximo(filaId, usuarioId, guiche));
    }

    @Test void finalizarAtendimento_sucesso() {
        UUID entradaId = UUID.randomUUID();
        EntradaFila entrada = new EntradaFila(); entrada.setId(entradaId); entrada.setStatus(StatusFila.CHAMADO);
        EntradaFila atendido = new EntradaFila(); atendido.setId(entradaId); atendido.setStatus(StatusFila.ATENDIDO);
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(atendido);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.finalizarAtendimento(entradaId);
        assertNotNull(result);
    }

    @Test void finalizarAtendimento_statusInvalido() {
        UUID entradaId = UUID.randomUUID();
        EntradaFila entrada = new EntradaFila(); entrada.setId(entradaId); entrada.setStatus(StatusFila.AGUARDANDO);
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.of(entrada));
        assertThrows(BusinessException.class, () -> service.finalizarAtendimento(entradaId));
    }

    @Test void cancelarAtendimento_sucesso() {
        UUID entradaId = UUID.randomUUID();
        EntradaFila entrada = new EntradaFila(); entrada.setId(entradaId); entrada.setStatus(StatusFila.CHAMADO);
        EntradaFila cancelada = new EntradaFila(); cancelada.setId(entradaId); cancelada.setStatus(StatusFila.CANCELADO);
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.of(entrada));
        doNothing().when(entradaFilaRepository).delete(entrada);
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.of(cancelada));
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.cancelarAtendimento(entradaId);
        assertNotNull(result);
    }

    @Test void cancelarAtendimento_statusAtendido() {
        UUID entradaId = UUID.randomUUID();
        EntradaFila entrada = new EntradaFila(); entrada.setId(entradaId); entrada.setStatus(StatusFila.ATENDIDO);
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.of(entrada));
        assertThrows(BusinessException.class, () -> service.cancelarAtendimento(entradaId));
    }

    // Outros testes podem ser implementados aqui
}
