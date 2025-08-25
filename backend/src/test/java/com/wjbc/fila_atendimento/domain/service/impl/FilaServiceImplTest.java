package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.FilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaUpdateDTO;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.FilaMapper;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.EntradaFilaRepository;
import com.wjbc.fila_atendimento.domain.repository.FilaRepository;
import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FilaServiceImplTest {
    @Mock
    private FilaRepository filaRepository;
    @Mock
    private FilaMapper filaMapper;
    @Mock
    private UnidadeAtendimentoService unidadeService;
    @Mock
    private SetorService setorService;
    @Mock
    private EntradaFilaRepository entradaFilaRepository;
    @InjectMocks
    private FilaServiceImpl service;

    private UUID id;
    private Fila fila;
    private UnidadeAtendimento unidade;
    private Setor setor;
    private FilaCreateDTO createDTO;
    private FilaUpdateDTO updateDTO;
    private FilaResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        id = UUID.randomUUID();
        unidade = mock(UnidadeAtendimento.class);
        setor = mock(Setor.class);
        fila = new Fila();
        fila.setId(id);
        fila.setNome("Fila Teste");
        fila.setUnidadeAtendimento(unidade);
        fila.setSetor(setor);
        fila.setAtiva(true);
        createDTO = mock(FilaCreateDTO.class);
        when(createDTO.nome()).thenReturn("Fila Teste");
        when(createDTO.unidadeAtendimentoId()).thenReturn(UUID.randomUUID());
        when(createDTO.setorId()).thenReturn(UUID.randomUUID());
        updateDTO = mock(FilaUpdateDTO.class);
        responseDTO = mock(FilaResponseDTO.class);
    }

    @Test
    void testCriar_Success() {
        when(unidadeService.findUnidadeById(any())).thenReturn(unidade);
        when(setorService.findSetorById(any())).thenReturn(setor);
        when(filaRepository.findByNomeAndUnidadeAtendimento(anyString(), any())).thenReturn(Optional.empty());
        when(filaMapper.toEntity(createDTO, setor, unidade)).thenReturn(fila);
        when(filaRepository.save(fila)).thenReturn(fila);
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        when(filaMapper.toResponseDTO(fila)).thenReturn(responseDTO);
        FilaResponseDTO result = service.criar(createDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testCriar_DuplicateName() {
        when(unidadeService.findUnidadeById(any())).thenReturn(unidade);
        when(setorService.findSetorById(any())).thenReturn(setor);
        Fila existing = new Fila();
        existing.setId(UUID.randomUUID());
        when(filaRepository.findByNomeAndUnidadeAtendimento(anyString(), any())).thenReturn(Optional.of(existing));
        assertThrows(BusinessException.class, () -> service.criar(createDTO));
    }

    @Test
    void testAtualizarParcialmente_Success() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        doNothing().when(filaMapper).applyPatchToEntity(updateDTO, fila);
        when(filaRepository.findByNomeAndUnidadeAtendimento(anyString(), any())).thenReturn(Optional.empty());
        when(filaRepository.save(fila)).thenReturn(fila);
        when(filaMapper.toResponseDTO(fila)).thenReturn(responseDTO);
        FilaResponseDTO result = service.atualizarParcialmente(id, updateDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testAtualizarParcialmente_DuplicateName() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        doNothing().when(filaMapper).applyPatchToEntity(updateDTO, fila);
        Fila other = new Fila();
        other.setId(UUID.randomUUID());
        when(filaRepository.findByNomeAndUnidadeAtendimento(anyString(), any())).thenReturn(Optional.of(other));
        assertThrows(BusinessException.class, () -> service.atualizarParcialmente(id, updateDTO));
    }

    @Test
    void testAtualizarParcialmente_DuplicateNameButSameId() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        doNothing().when(filaMapper).applyPatchToEntity(updateDTO, fila);
        Fila same = new Fila();
        same.setId(id);
        when(filaRepository.findByNomeAndUnidadeAtendimento(anyString(), any())).thenReturn(Optional.of(same));
        when(filaRepository.save(fila)).thenReturn(fila);
        when(filaMapper.toResponseDTO(fila)).thenReturn(responseDTO);
        FilaResponseDTO result = service.atualizarParcialmente(id, updateDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testAtualizarParcialmente_NotFound() {
        when(filaRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.atualizarParcialmente(id, updateDTO));
    }

    @Test
    void testDesativar_Success() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        when(entradaFilaRepository.existsByFilaAndStatus(fila, StatusFila.AGUARDANDO)).thenReturn(false);
        doNothing().when(filaRepository).delete(fila);
        assertDoesNotThrow(() -> service.desativar(id));
        verify(filaRepository).delete(fila);
    }

    @Test
    void testDesativar_NotFound() {
        when(filaRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.desativar(id));
    }

    @Test
    void testDesativar_WithClientsWaiting() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        when(entradaFilaRepository.existsByFilaAndStatus(fila, StatusFila.AGUARDANDO)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.desativar(id));
    }

    @Test
    void testBuscarPorId_Success() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        when(filaMapper.toResponseDTO(fila)).thenReturn(responseDTO);
        FilaResponseDTO result = service.buscarPorId(id);
        assertEquals(responseDTO, result);
    }

    @Test
    void testBuscarPorId_NotFound() {
        when(filaRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.buscarPorId(id));
    }

    @Test
    void testFindFilaById_Success() {
        when(filaRepository.findById(id)).thenReturn(Optional.of(fila));
        Fila result = service.findFilaById(id);
        assertEquals(fila, result);
    }

    @Test
    void testFindFilaById_NotFound() {
        when(filaRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.findFilaById(id));
    }

    @Test
    void testListarPorUnidade() {
        List<Fila> filas = Arrays.asList(fila);
        when(unidadeService.findUnidadeById(any())).thenReturn(unidade);
        when(filaRepository.findByUnidadeAtendimento(unidade)).thenReturn(filas);
        when(filaMapper.toResponseDTO(fila)).thenReturn(responseDTO);
        List<FilaResponseDTO> result = service.listarPorUnidade(UUID.randomUUID());
        assertEquals(1, result.size());
        assertEquals(responseDTO, result.get(0));
    }

    @Test
    void testFindBySetorId() {
        List<Fila> filas = Arrays.asList(fila);
        when(setorService.findSetorById(any())).thenReturn(setor);
        when(filaRepository.findBySetor(setor)).thenReturn(filas);
        List<Fila> result = service.findBySetorId(UUID.randomUUID());
        assertEquals(1, result.size());
        assertEquals(fila, result.get(0));
    }
}
