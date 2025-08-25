package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoUpdateDTO;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.UnidadeAtendimentoMapper;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.FilaRepository;
import com.wjbc.fila_atendimento.domain.repository.UnidadeAtendimentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UnidadeAtendimentoServiceImplTest {
    @Mock
    private UnidadeAtendimentoRepository unidadeRepository;
    @Mock
    private UnidadeAtendimentoMapper unidadeMapper;
    @Mock
    private FilaRepository filaRepository;
    @InjectMocks
    private UnidadeAtendimentoServiceImpl service;

    private UnidadeAtendimento unidade;
    private UnidadeAtendimentoCreateDTO createDTO;
    private UnidadeAtendimentoUpdateDTO updateDTO;
    private UnidadeAtendimentoResponseDTO responseDTO;
    private UUID id;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        id = UUID.randomUUID();
        unidade = new UnidadeAtendimento();
        unidade.setId(id);
        unidade.setNome("Unidade Teste");
        unidade.setAtivo(true);
        createDTO = mock(UnidadeAtendimentoCreateDTO.class);
        when(createDTO.nome()).thenReturn("Unidade Teste");
        updateDTO = mock(UnidadeAtendimentoUpdateDTO.class);
        responseDTO = mock(UnidadeAtendimentoResponseDTO.class);
    }

    @Test
    void testCriar_Success() {
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(unidadeMapper.toEntity(createDTO)).thenReturn(unidade);
        when(unidadeRepository.save(unidade)).thenReturn(unidade);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        UnidadeAtendimentoResponseDTO result = service.criar(createDTO);
        assertEquals(responseDTO, result);
        verify(unidadeRepository).save(unidade);
    }

    @Test
    void testCriar_DuplicateName() {
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.of(unidade));
        assertThrows(BusinessException.class, () -> service.criar(createDTO));
    }

    @Test
    void testSubstituir_Success() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(unidadeRepository.save(unidade)).thenReturn(unidade);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        UnidadeAtendimentoResponseDTO result = service.substituir(id, createDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testSubstituir_NotFound() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.substituir(id, createDTO));
    }

    @Test
    void testSubstituir_DuplicateName() {
        UnidadeAtendimento other = new UnidadeAtendimento();
        other.setId(UUID.randomUUID());
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.of(other));
        assertThrows(BusinessException.class, () -> service.substituir(id, createDTO));
    }

    @Test
    void testSubstituir_DuplicateNameButSameId() {
        // O nome já existe, mas é da própria unidade (idExcluido igual ao id da unidade encontrada)
        UnidadeAtendimento same = new UnidadeAtendimento();
        same.setId(id);
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.of(same));
        when(unidadeRepository.save(unidade)).thenReturn(unidade);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        UnidadeAtendimentoResponseDTO result = service.substituir(id, createDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testAtualizarParcialmente_Success() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        doNothing().when(unidadeMapper).applyPatchToEntity(updateDTO, unidade);
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(unidadeRepository.save(unidade)).thenReturn(unidade);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        UnidadeAtendimentoResponseDTO result = service.atualizarParcialmente(id, updateDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testAtualizarParcialmente_NotFound() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.atualizarParcialmente(id, updateDTO));
    }

    @Test
    void testAtualizarParcialmente_DuplicateName() {
        UnidadeAtendimento other = new UnidadeAtendimento();
        other.setId(UUID.randomUUID());
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        doNothing().when(unidadeMapper).applyPatchToEntity(updateDTO, unidade);
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.of(other));
        assertThrows(BusinessException.class, () -> service.atualizarParcialmente(id, updateDTO));
    }

    @Test
    void testAtualizarParcialmente_DuplicateNameButSameId() {
        UnidadeAtendimento same = new UnidadeAtendimento();
        same.setId(id);
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        doNothing().when(unidadeMapper).applyPatchToEntity(updateDTO, unidade);
        when(unidadeRepository.findByNome(anyString())).thenReturn(Optional.of(same));
        when(unidadeRepository.save(unidade)).thenReturn(unidade);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        UnidadeAtendimentoResponseDTO result = service.atualizarParcialmente(id, updateDTO);
        assertEquals(responseDTO, result);
    }

    @Test
    void testDesativar_Success() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        when(filaRepository.existsByUnidadeAtendimentoAndAtivaIsTrue(unidade)).thenReturn(false);
        doNothing().when(unidadeRepository).delete(unidade);
        assertDoesNotThrow(() -> service.desativar(id));
        verify(unidadeRepository).delete(unidade);
    }

    @Test
    void testDesativar_NotFound() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.desativar(id));
    }

    @Test
    void testDesativar_WithActiveQueue() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        when(filaRepository.existsByUnidadeAtendimentoAndAtivaIsTrue(unidade)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.desativar(id));
    }

    @Test
    void testBuscarPorId_Success() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        UnidadeAtendimentoResponseDTO result = service.buscarPorId(id);
        assertEquals(responseDTO, result);
    }

    @Test
    void testBuscarPorId_NotFound() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.buscarPorId(id));
    }

    @Test
    void testListarTodas() {
        List<UnidadeAtendimento> unidades = Arrays.asList(unidade);
        when(unidadeRepository.findAll()).thenReturn(unidades);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        List<UnidadeAtendimentoResponseDTO> result = service.listarTodas();
        assertEquals(1, result.size());
        assertEquals(responseDTO, result.get(0));
    }

    @Test
    void testBuscarPorNomeContendo() {
        List<UnidadeAtendimento> unidades = Arrays.asList(unidade);
        when(unidadeRepository.findByNomeContainingIgnoreCase(anyString())).thenReturn(unidades);
        when(unidadeMapper.toResponseDTO(unidade)).thenReturn(responseDTO);
        List<UnidadeAtendimentoResponseDTO> result = service.buscarPorNomeContendo("Teste");
        assertEquals(1, result.size());
        assertEquals(responseDTO, result.get(0));
    }

    @Test
    void testFindUnidadeById_Success() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.of(unidade));
        UnidadeAtendimento result = service.findUnidadeById(id);
        assertEquals(unidade, result);
    }

    @Test
    void testFindUnidadeById_NotFound() {
        when(unidadeRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.findUnidadeById(id));
    }
}
