package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.PainelCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelResponseDTO;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.model.Painel;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.PainelRepository;
import com.wjbc.fila_atendimento.domain.repository.UnidadeAtendimentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PainelServiceImplTest {
    @Mock
    private PainelRepository painelRepository;
    @Mock
    private UnidadeAtendimentoRepository unidadeAtendimentoRepository;

    @InjectMocks
    private PainelServiceImpl painelService;

    private UUID painelId;
    private UUID unidadeId;
    private Painel painel;
    private UnidadeAtendimento unidade;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        painelId = UUID.randomUUID();
        unidadeId = UUID.randomUUID();
        unidade = new UnidadeAtendimento();
        unidade.setId(unidadeId);
        unidade.setNome("Unidade Teste");
        painel = new Painel();
        painel.setId(painelId);
        painel.setDescricao("Painel Teste");
        painel.setUnidadeAtendimento(unidade);
    }

    @Test
    void testCriarSuccess() {
        PainelCreateDTO dto = new PainelCreateDTO("Painel Teste", unidadeId);
        when(unidadeAtendimentoRepository.findById(unidadeId)).thenReturn(Optional.of(unidade));
        when(painelRepository.save(any(Painel.class))).thenReturn(painel);
        PainelResponseDTO response = painelService.criar(dto);
        assertEquals(painelId, response.id());
        assertEquals("Painel Teste", response.descricao());
        assertEquals(unidadeId, response.unidadeAtendimentoId());
    }

    @Test
    void testCriarUnidadeNotFound() {
        PainelCreateDTO dto = new PainelCreateDTO("Painel Teste", unidadeId);
        when(unidadeAtendimentoRepository.findById(unidadeId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> painelService.criar(dto));
    }

    @Test
    void testAtualizarSuccess() {
        PainelUpdateDTO dto = new PainelUpdateDTO("Painel Atualizado", unidadeId);
        when(painelRepository.findById(painelId)).thenReturn(Optional.of(painel));
        when(unidadeAtendimentoRepository.findById(unidadeId)).thenReturn(Optional.of(unidade));
        when(painelRepository.save(any(Painel.class))).thenReturn(painel);
        PainelResponseDTO response = painelService.atualizar(painelId, dto);
        assertEquals(painelId, response.id());
        assertEquals("Painel Atualizado", response.descricao());
        assertEquals(unidadeId, response.unidadeAtendimentoId());
    }

    @Test
    void testAtualizarPainelNotFound() {
        PainelUpdateDTO dto = new PainelUpdateDTO("Painel Atualizado", unidadeId);
        when(painelRepository.findById(painelId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> painelService.atualizar(painelId, dto));
    }

    @Test
    void testAtualizarUnidadeNotFound() {
        PainelUpdateDTO dto = new PainelUpdateDTO("Painel Atualizado", unidadeId);
        when(painelRepository.findById(painelId)).thenReturn(Optional.of(painel));
        when(unidadeAtendimentoRepository.findById(unidadeId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> painelService.atualizar(painelId, dto));
    }

    @Test
    void testBuscarPorIdSuccess() {
        when(painelRepository.findById(painelId)).thenReturn(Optional.of(painel));
        PainelResponseDTO response = painelService.buscarPorId(painelId, unidadeId);
        assertEquals(painelId, response.id());
        assertEquals(unidadeId, response.unidadeAtendimentoId());
    }

    @Test
    void testBuscarPorIdPainelNotFound() {
        when(painelRepository.findById(painelId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> painelService.buscarPorId(painelId, unidadeId));
    }

    @Test
    void testBuscarPorIdUnidadeErrada() {
        UUID outraUnidadeId = UUID.randomUUID();
        UnidadeAtendimento outraUnidade = new UnidadeAtendimento();
        outraUnidade.setId(outraUnidadeId);
        painel.setUnidadeAtendimento(outraUnidade);
        when(painelRepository.findById(painelId)).thenReturn(Optional.of(painel));
        assertThrows(ResourceNotFoundException.class, () -> painelService.buscarPorId(painelId, unidadeId));
    }

    @Test
    void testListarTodosSuccess() {
        when(painelRepository.findByUnidadeAtendimentoId(unidadeId)).thenReturn(Collections.singletonList(painel));
        List<PainelResponseDTO> lista = painelService.listarTodos(unidadeId);
        assertEquals(1, lista.size());
        assertEquals(painelId, lista.get(0).id());
    }

    @Test
    void testListarPorUnidadeSuccess() {
        when(painelRepository.findByUnidadeAtendimentoId(unidadeId)).thenReturn(Collections.singletonList(painel));
        List<PainelResponseDTO> lista = painelService.listarPorUnidade(unidadeId);
        assertEquals(1, lista.size());
        assertEquals(painelId, lista.get(0).id());
    }

    @Test
    void testDesativarSuccess() {
        when(painelRepository.findById(painelId)).thenReturn(Optional.of(painel));
        doNothing().when(painelRepository).delete(painel);
        assertDoesNotThrow(() -> painelService.desativar(painelId));
        verify(painelRepository, times(1)).delete(painel);
    }

    @Test
    void testDesativarPainelNotFound() {
        when(painelRepository.findById(painelId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> painelService.desativar(painelId));
    }
}

