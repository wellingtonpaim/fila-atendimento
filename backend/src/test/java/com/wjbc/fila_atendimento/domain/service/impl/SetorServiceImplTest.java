package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.SetorMapper;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.repository.FilaRepository;
import com.wjbc.fila_atendimento.domain.repository.SetorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SetorServiceImplTest {
    @Mock
    private SetorRepository setorRepository;
    @Mock
    private FilaRepository filaRepository;
    @Mock
    private SetorMapper setorMapper;

    @InjectMocks
    private SetorServiceImpl setorService;

    private UUID setorId;
    private Setor setor;
    private SetorCreateDTO createDTO;
    private SetorUpdateDTO updateDTO;
    private SetorResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        setorId = UUID.randomUUID();
        setor = new Setor();
        setor.setId(setorId);
        setor.setNome("Setor Teste");
        setor.setAtivo(true);
        createDTO = new SetorCreateDTO("Setor Teste");
        updateDTO = new SetorUpdateDTO("Setor Atualizado");
        responseDTO = new SetorResponseDTO(setorId, "Setor Teste");
    }

    @Test
    void testCriarSuccess() {
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(setorMapper.toEntity(any(SetorCreateDTO.class))).thenReturn(setor);
        when(setorRepository.save(any(Setor.class))).thenReturn(setor);
        when(setorMapper.toResponseDTO(any(Setor.class))).thenReturn(responseDTO);
        SetorResponseDTO result = setorService.criar(createDTO);
        assertEquals(setorId, result.id());
        assertEquals("Setor Teste", result.nome());
    }

    @Test
    void testCriarNomeDuplicado() {
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.of(setor));
        assertThrows(BusinessException.class, () -> setorService.criar(createDTO));
    }

    @Test
    void testSubstituirSuccess() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(setorRepository.save(any(Setor.class))).thenReturn(setor);
        when(setorMapper.toResponseDTO(any(Setor.class))).thenReturn(responseDTO);
        SetorResponseDTO result = setorService.substituir(setorId, createDTO);
        assertEquals(setorId, result.id());
    }

    @Test
    void testSubstituirSetorNotFound() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> setorService.substituir(setorId, createDTO));
    }

    @Test
    void testSubstituirNomeDuplicado() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        Setor outroSetor = new Setor();
        outroSetor.setId(UUID.randomUUID());
        outroSetor.setNome("Setor Teste");
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.of(outroSetor));
        assertThrows(BusinessException.class, () -> setorService.substituir(setorId, createDTO));
    }

    @Test
    void testAtualizarParcialmenteSuccess() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        doAnswer(invocation -> {
            SetorUpdateDTO dto = invocation.getArgument(0);
            Setor s = invocation.getArgument(1);
            s.setNome(dto.nome());
            return null;
        }).when(setorMapper).applyPatchToEntity(any(SetorUpdateDTO.class), any(Setor.class));
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(setorRepository.save(any(Setor.class))).thenReturn(setor);
        when(setorMapper.toResponseDTO(any(Setor.class))).thenReturn(new SetorResponseDTO(setorId, "Setor Atualizado"));
        SetorResponseDTO result = setorService.atualizarParcialmente(setorId, updateDTO);
        assertEquals("Setor Atualizado", result.nome());
    }

    @Test
    void testAtualizarParcialmenteSetorNotFound() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> setorService.atualizarParcialmente(setorId, updateDTO));
    }

    @Test
    void testAtualizarParcialmenteNomeDuplicado() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        Setor outroSetor = new Setor();
        outroSetor.setId(UUID.randomUUID());
        outroSetor.setNome("Setor Atualizado");
        doAnswer(invocation -> {
            SetorUpdateDTO dto = invocation.getArgument(0);
            Setor s = invocation.getArgument(1);
            s.setNome(dto.nome());
            return null;
        }).when(setorMapper).applyPatchToEntity(any(SetorUpdateDTO.class), any(Setor.class));
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.of(outroSetor));
        assertThrows(BusinessException.class, () -> setorService.atualizarParcialmente(setorId, updateDTO));
    }

    @Test
    void testBuscarPorIdSuccess() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        when(setorMapper.toResponseDTO(any(Setor.class))).thenReturn(responseDTO);
        SetorResponseDTO result = setorService.buscarPorId(setorId);
        assertEquals(setorId, result.id());
    }

    @Test
    void testBuscarPorIdNotFound() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> setorService.buscarPorId(setorId));
    }

    @Test
    void testListarTodosSuccess() {
        when(setorRepository.findAll()).thenReturn(Collections.singletonList(setor));
        when(setorMapper.toResponseDTO(any(Setor.class))).thenReturn(responseDTO);
        List<SetorResponseDTO> lista = setorService.listarTodos();
        assertEquals(1, lista.size());
        assertEquals(setorId, lista.get(0).id());
    }

    @Test
    void testBuscarPorNomeContendoSuccess() {
        when(setorRepository.findByNomeContainingIgnoreCase(anyString())).thenReturn(Collections.singletonList(setor));
        when(setorMapper.toResponseDTO(any(Setor.class))).thenReturn(responseDTO);
        List<SetorResponseDTO> lista = setorService.buscarPorNomeContendo("Teste");
        assertEquals(1, lista.size());
        assertEquals(setorId, lista.get(0).id());
    }

    @Test
    void testDesativarSuccess() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        when(filaRepository.existsBySetorAndAtivaIsTrue(setor)).thenReturn(false);
        doNothing().when(setorRepository).delete(setor);
        assertDoesNotThrow(() -> setorService.desativar(setorId));
        verify(setorRepository, times(1)).delete(setor);
    }

    @Test
    void testDesativarSetorNotFound() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> setorService.desativar(setorId));
    }

    @Test
    void testDesativarComFilaAtiva() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        when(filaRepository.existsBySetorAndAtivaIsTrue(setor)).thenReturn(true);
        assertThrows(BusinessException.class, () -> setorService.desativar(setorId));
    }

    @Test
    void testFindSetorByIdSuccess() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        Setor result = setorService.findSetorById(setorId);
        assertEquals(setorId, result.getId());
    }

    @Test
    void testFindSetorByIdNotFound() {
        when(setorRepository.findById(setorId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> setorService.findSetorById(setorId));
    }

    @Test
    void testValidarNomeComIdExcluidoIgual() {
        // Simula setor encontrado com mesmo id do idExcluido
        when(setorRepository.findByNome(anyString())).thenReturn(Optional.of(setor));
        when(setorRepository.findById(setorId)).thenReturn(Optional.of(setor));
        // Chama método privado via método público que usa validarNome
        // Aqui, como o id é igual ao idExcluido, não deve lançar exceção
        assertDoesNotThrow(() -> setorService.substituir(setorId, createDTO));
    }
}
