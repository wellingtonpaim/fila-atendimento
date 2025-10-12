package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.EntradaFilaMapper;
import com.wjbc.fila_atendimento.domain.model.*;
import com.wjbc.fila_atendimento.domain.repository.EntradaFilaRepository;
import com.wjbc.fila_atendimento.domain.repository.PainelRepository;
import com.wjbc.fila_atendimento.domain.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EntradaFilaServiceImplTest {
    @Mock EntradaFilaRepository entradaFilaRepository;
    @Mock PainelRepository painelRepository; // novo mock
    @Mock EntradaFilaMapper entradaFilaMapper;
    @Mock ClienteService clienteService;
    @Mock FilaService filaService;
    @Mock UsuarioService usuarioService;
    @Mock FilaBroadcastService filaBroadcastService;
    @InjectMocks EntradaFilaServiceImpl service;

    private AutoCloseable mocks;

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
        // Stub padrão: nenhum painel associado -> evita NPE em notificarPaineis
        when(painelRepository.findPaineisByFilaId(any())).thenReturn(Collections.emptyList());
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() throws Exception {
        if (mocks != null) {
            mocks.close();
        }
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
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setCliente(cliente); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        when(clienteService.findClienteById(clienteId)).thenReturn(cliente);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, fila, StatusFila.AGUARDANDO)).thenReturn(false);
        when(entradaFilaRepository.save(any())).thenReturn(entrada);
        when(entradaFilaRepository.findById(entrada.getId())).thenReturn(Optional.of(entrada));
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
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
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

    @Test void chamarProximo_medicoSemRetornoChamaNormal() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A2";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Atendimento Médico");
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, true)).thenReturn(Optional.empty());
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
        Fila fila = new Fila(); fila.setId(UUID.randomUUID());
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        EntradaFila entrada = new EntradaFila(); entrada.setId(entradaId); entrada.setStatus(StatusFila.CHAMADO); entrada.setFila(fila);
        EntradaFila atendido = new EntradaFila(); atendido.setId(entradaId); atendido.setStatus(StatusFila.ATENDIDO); atendido.setFila(fila);
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

    @Test void cancelarAtendimento_entradaNaoEncontrada() {
        UUID entradaId = UUID.randomUUID();
        EntradaFila entrada = new EntradaFila(); entrada.setId(entradaId); entrada.setStatus(StatusFila.CHAMADO);
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.of(entrada)).thenReturn(Optional.empty());
        doNothing().when(entradaFilaRepository).delete(entrada);
        assertThrows(ResourceNotFoundException.class, () -> service.cancelarAtendimento(entradaId));
    }

    @Test void encaminharParaFila_sucesso() {
        UUID entradaIdOrigem = UUID.randomUUID();
        UUID clienteId = UUID.randomUUID();
        UUID filaIdDestino = UUID.randomUUID();
        EntradaFilaCreateDTO dtoDestino = new EntradaFilaCreateDTO(clienteId, filaIdDestino, true, true);
        Fila filaDestino = new Fila(); filaDestino.setId(filaIdDestino);
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); filaDestino.setSetor(setor);
        when(filaService.findFilaById(filaIdDestino)).thenReturn(filaDestino);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFila entradaOrigem = new EntradaFila(); entradaOrigem.setId(entradaIdOrigem); entradaOrigem.setStatus(StatusFila.CHAMADO); entradaOrigem.setFila(filaDestino);
        EntradaFila atendido = new EntradaFila(); atendido.setId(entradaIdOrigem); atendido.setStatus(StatusFila.ATENDIDO); atendido.setFila(filaDestino);
        when(entradaFilaRepository.findById(entradaIdOrigem)).thenReturn(Optional.of(entradaOrigem));
        when(entradaFilaRepository.save(any())).thenReturn(atendido);
        Cliente cliente = new Cliente(); cliente.setId(clienteId);
        when(clienteService.findClienteById(clienteId)).thenReturn(cliente);
        when(entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, filaDestino, StatusFila.AGUARDANDO)).thenReturn(false);
        EntradaFila entradaNova = new EntradaFila(); entradaNova.setId(UUID.randomUUID()); entradaNova.setCliente(cliente); entradaNova.setFila(filaDestino); entradaNova.setStatus(StatusFila.AGUARDANDO);
        when(entradaFilaRepository.save(any())).thenReturn(entradaNova);
        when(entradaFilaRepository.findById(entradaNova.getId())).thenReturn(Optional.of(entradaNova));
        EntradaFilaResponseDTO result = service.encaminharParaFila(entradaIdOrigem, dtoDestino);
        assertNotNull(result);
    }

    @Test void listarAguardandoPorFila_vazio() {
        UUID filaId = UUID.randomUUID();
        Fila fila = new Fila(); fila.setId(filaId);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.findByFilaAndStatusOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO)).thenReturn(Collections.emptyList());
        List<EntradaFilaResponseDTO> result = service.listarAguardandoPorFila(filaId);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test void listarAguardandoPorFila_comElementos() {
        UUID filaId = UUID.randomUUID();
        Fila fila = new Fila(); fila.setId(filaId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.findByFilaAndStatusOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO)).thenReturn(List.of(entrada));
        when(entradaFilaMapper.toResponseDTO(entrada)).thenReturn(mockResponseDTO());
        List<EntradaFilaResponseDTO> result = service.listarAguardandoPorFila(filaId);
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test void findEntradaFilaById_naoEncontrado() {
        UUID id = UUID.randomUUID();
        when(entradaFilaRepository.findById(id)).thenReturn(Optional.empty());
        try {
            java.lang.reflect.Method m = EntradaFilaServiceImpl.class.getDeclaredMethod("findEntradaFilaById", UUID.class);
            m.setAccessible(true);
            m.invoke(service, id);
            fail("Esperado ResourceNotFoundException");
        } catch (java.lang.reflect.InvocationTargetException e) {
            assertInstanceOf(ResourceNotFoundException.class, e.getCause());
        } catch (Exception e) {
            fail("Erro inesperado: " + e.getMessage());
        }
    }

    @Test void adicionarClienteAFila_prioridadeRetornoTrue() {
        UUID clienteId = UUID.randomUUID();
        UUID filaId = UUID.randomUUID();
        EntradaFilaCreateDTO dto = new EntradaFilaCreateDTO(clienteId, filaId, true, true);
        Cliente cliente = new Cliente(); cliente.setId(clienteId);
        Fila fila = new Fila(); fila.setId(filaId);
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setCliente(cliente); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        when(clienteService.findClienteById(clienteId)).thenReturn(cliente);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, fila, StatusFila.AGUARDANDO)).thenReturn(false);
        when(entradaFilaRepository.save(any())).thenReturn(entrada);
        when(entradaFilaRepository.findById(entrada.getId())).thenReturn(Optional.of(entrada));
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.adicionarClienteAFila(dto);
        assertNotNull(result);
    }

    @Test void chamarProximo_medicoComRetornoTrue() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A2";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Atendimento Médico");
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, true)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(chamado);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.chamarProximo(filaId, usuarioId, guiche);
        assertNotNull(result);
    }

    @Test void chamarProximo_mensagemVocalizacaoCamposNulos() throws Exception {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, false)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(chamado);
        doReturn(new EntradaFilaResponseDTO(UUID.randomUUID(), StatusFila.CHAMADO, false, false, null, null, null, null, null, null, UUID.randomUUID())).when(entradaFilaMapper).toResponseDTO(any());
        EntradaFilaServiceImpl spyService = spy(service);
        java.lang.reflect.Method mChamadaAtual = EntradaFilaServiceImpl.class.getDeclaredMethod("getChamadaAtual", Fila.class);
        mChamadaAtual.setAccessible(true);
        EntradaFilaResponseDTO result = spyService.chamarProximo(filaId, usuarioId, guiche);
        assertNotNull(result);
    }

    @Test void getChamadaAtual_optionalVazio() throws Exception {
        Fila fila = new Fila(); fila.setId(UUID.randomUUID());
        EntradaFilaServiceImpl spyService = spy(service);
        doReturn(Optional.empty()).when(entradaFilaRepository).findFirstByFilaAndStatusOrderByDataHoraChamadaDesc(fila, StatusFila.CHAMADO);
        java.lang.reflect.Method m = EntradaFilaServiceImpl.class.getDeclaredMethod("getChamadaAtual", Fila.class);
        m.setAccessible(true);
        Object result = m.invoke(spyService, fila);
        assertNull(result);
    }

    @Test void getUltimasChamadas_listaVazia() throws Exception {
        Fila fila = new Fila(); fila.setId(UUID.randomUUID());
        EntradaFilaServiceImpl spyService = spy(service);
        doReturn(Collections.emptyList()).when(entradaFilaRepository).findTop3ByFilaAndStatusOrderByDataHoraChamadaDesc(fila, StatusFila.CHAMADO);
        java.lang.reflect.Method m = EntradaFilaServiceImpl.class.getDeclaredMethod("getUltimasChamadas", Fila.class);
        m.setAccessible(true);
        Object result = m.invoke(spyService, fila);
        assertInstanceOf(List.class, result);
        assertTrue(((List<?>) result).isEmpty());
    }

    @Test void getFilaAtual_listaVazia() throws Exception {
        UUID setorId = UUID.randomUUID();
        EntradaFilaServiceImpl spyService = spy(service);
        doReturn(Collections.emptyList()).when(filaService).findBySetorId(setorId);
        java.lang.reflect.Method m = EntradaFilaServiceImpl.class.getDeclaredMethod("getFilaAtual", UUID.class);
        m.setAccessible(true);
        Object result = m.invoke(spyService, setorId);
        assertInstanceOf(List.class, result);
        assertTrue(((List<?>) result).isEmpty());
    }

    @Test void adicionarClienteAFila_clienteNull() {
        UUID clienteId = UUID.randomUUID();
        UUID filaId = UUID.randomUUID();
        EntradaFilaCreateDTO dto = new EntradaFilaCreateDTO(clienteId, filaId, false, false);
        when(clienteService.findClienteById(clienteId)).thenThrow(new ResourceNotFoundException("Cliente não encontrado"));
        when(filaService.findFilaById(filaId)).thenReturn(new Fila());
        assertThrows(ResourceNotFoundException.class, () -> service.adicionarClienteAFila(dto));
    }

    @Test void adicionarClienteAFila_filaNull() {
        UUID clienteId = UUID.randomUUID();
        UUID filaId = UUID.randomUUID();
        EntradaFilaCreateDTO dto = new EntradaFilaCreateDTO(clienteId, filaId, false, false);
        when(clienteService.findClienteById(clienteId)).thenReturn(new Cliente());
        when(filaService.findFilaById(filaId)).thenThrow(new ResourceNotFoundException("Fila não encontrada"));
        assertThrows(ResourceNotFoundException.class, () -> service.adicionarClienteAFila(dto));
    }

    @Test void adicionarClienteAFila_broadcastChamado() {
        UUID clienteId = UUID.randomUUID();
        UUID filaId = UUID.randomUUID();
        EntradaFilaCreateDTO dto = new EntradaFilaCreateDTO(clienteId, filaId, false, false);
        Cliente cliente = new Cliente(); cliente.setId(clienteId);
        Fila fila = new Fila(); fila.setId(filaId);
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setCliente(cliente); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        Painel painel = new Painel(); painel.setId(UUID.randomUUID()); painel.setFilas(List.of(fila));
        when(painelRepository.findPaineisByFilaId(fila.getId())).thenReturn(List.of(painel));
        when(clienteService.findClienteById(clienteId)).thenReturn(cliente);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, fila, StatusFila.AGUARDANDO)).thenReturn(false);
        when(entradaFilaRepository.save(any())).thenReturn(entrada);
        when(entradaFilaRepository.findById(entrada.getId())).thenReturn(Optional.of(entrada));
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.adicionarClienteAFila(dto);
        assertNotNull(result);
        // Comportamento atualizado: não envia mais atualização ao painel público ao adicionar
        verify(filaBroadcastService, never()).broadcastPainelPublicoUpdate(any(), any());
        // Continua atualizando o painel profissional
        verify(filaBroadcastService, times(1)).broadcastFilaProfissionalUpdate(eq(setor.getId()), any());
    }

    @Test void chamarProximo_mensagemVocalizacaoVazia() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        Painel painel = new Painel(); painel.setId(UUID.randomUUID()); painel.setFilas(List.of(fila));
        when(painelRepository.findPaineisByFilaId(fila.getId())).thenReturn(List.of(painel));
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, false)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(chamado);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        when(entradaFilaRepository.findFirstByFilaAndStatusOrderByDataHoraChamadaDesc(fila, StatusFila.CHAMADO)).thenReturn(Optional.empty());
        EntradaFilaResponseDTO result = service.chamarProximo(filaId, usuarioId, guiche);
        assertNotNull(result);
        verify(filaBroadcastService, times(1)).broadcastPainelPublicoUpdate(eq(painel.getId()), any());
        verify(filaBroadcastService, times(1)).broadcastFilaProfissionalUpdate(eq(setor.getId()), any());
    }

    @Test void chamarProximo_listaUltimasChamadasVazia() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        Usuario usuario = new Usuario(); usuario.setId(usuarioId);
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(usuario);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, false)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(chamado);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        when(entradaFilaRepository.findTop3ByFilaAndStatusOrderByDataHoraChamadaDesc(fila, StatusFila.CHAMADO)).thenReturn(Collections.emptyList());
        EntradaFilaResponseDTO result = service.chamarProximo(filaId, usuarioId, guiche);
        assertNotNull(result);
    }

    @Test void getFilaAtual_listaFilasVazia() {
        UUID setorId = UUID.randomUUID();
        when(filaService.findBySetorId(setorId)).thenReturn(Collections.emptyList());
        try {
            java.lang.reflect.Method m = EntradaFilaServiceImpl.class.getDeclaredMethod("getFilaAtual", UUID.class);
            m.setAccessible(true);
            Object result = m.invoke(service, setorId);
            assertTrue(result instanceof List);
            assertTrue(((List<?>) result).isEmpty());
        } catch (Exception e) {
            fail("Erro ao testar getFilaAtual: " + e.getMessage());
        }
    }

    @Test void finalizarAtendimento_entradaNaoEncontrada() {
        UUID entradaId = UUID.randomUUID();
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.finalizarAtendimento(entradaId));
    }

    @Test void cancelarAtendimento_entradaNull() {
        UUID entradaId = UUID.randomUUID();
        when(entradaFilaRepository.findById(entradaId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.cancelarAtendimento(entradaId));
    }

    @Test void chamarProximo_usuarioNull() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        when(filaService.findFilaById(filaId)).thenReturn(fila);
        when(usuarioService.findUsuarioById(usuarioId)).thenReturn(null); // agora permitido (não lança exception na implementação atual)
        EntradaFila entrada = new EntradaFila(); entrada.setId(UUID.randomUUID()); entrada.setFila(fila); entrada.setStatus(StatusFila.AGUARDANDO);
        EntradaFila chamado = new EntradaFila(); chamado.setId(entrada.getId()); chamado.setFila(fila); chamado.setStatus(StatusFila.CHAMADO);
        when(entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO, false)).thenReturn(Optional.of(entrada));
        when(entradaFilaRepository.save(any())).thenReturn(chamado);
        when(entradaFilaMapper.toResponseDTO(any())).thenReturn(mockResponseDTO());
        EntradaFilaResponseDTO result = service.chamarProximo(filaId, usuarioId, guiche);
        assertNotNull(result); // comportamento atualizado
    }

    @Test void chamarProximo_filaNull() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        when(filaService.findFilaById(filaId)).thenReturn(null);
        assertThrows(NullPointerException.class, () -> service.chamarProximo(filaId, usuarioId, guiche));
    }

    @Test void chamarProximo_usuarioSemId() {
        UUID filaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        String guiche = "A1";
        Fila fila = new Fila(); fila.setId(filaId); fila.setNome("Triagem");
        com.wjbc.fila_atendimento.domain.model.Setor setor = new com.wjbc.fila_atendimento.domain.model.Setor(); setor.setId(UUID.randomUUID()); fila.setSetor(setor);
        Usuario usuario = new Usuario();
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
}
