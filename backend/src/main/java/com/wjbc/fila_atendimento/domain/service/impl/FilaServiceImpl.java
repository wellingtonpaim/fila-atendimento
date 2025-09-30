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
import com.wjbc.fila_atendimento.domain.service.FilaService;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilaServiceImpl implements FilaService {

    private final FilaRepository filaRepository;
    private final FilaMapper filaMapper;
    private final UnidadeAtendimentoService unidadeService;
    private final SetorService setorService;
    private final EntradaFilaRepository entradaFilaRepository;

    @Override
    @Transactional
    public FilaResponseDTO criar(FilaCreateDTO filaDTO) {
        UnidadeAtendimento unidade = unidadeService.findUnidadeById(filaDTO.unidadeAtendimentoId());
        Setor setor = setorService.findSetorById(filaDTO.setorId());

        validarNomeUnico(filaDTO.nome(), unidade, null);

        Fila fila = filaMapper.toEntity(filaDTO, setor, unidade);
        fila.setAtiva(true);

        Fila filaSalva = filaRepository.save(fila);

        return filaMapper.toResponseDTO(findFilaById(filaSalva.getId()));
    }

    @Override
    @Transactional
    public FilaResponseDTO atualizarParcialmente(UUID id, FilaUpdateDTO filaDTO) {
        Fila filaExistente = findFilaById(id);
        filaMapper.applyPatchToEntity(filaDTO, filaExistente);

        validarNomeUnico(filaExistente.getNome(), filaExistente.getUnidadeAtendimento(), id);

        Fila filaSalva = filaRepository.save(filaExistente);
        return filaMapper.toResponseDTO(filaSalva);
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        Fila fila = findFilaById(id);

        if (entradaFilaRepository.existsByFilaAndStatus(fila, StatusFila.AGUARDANDO)) {
            throw new BusinessException("Fila não pode ser desativada pois possui clientes aguardando atendimento.");
        }

        filaRepository.delete(fila);
    }

    @Override
    @Transactional(readOnly = true)
    public FilaResponseDTO buscarPorId(UUID id) {
        Fila fila = findFilaById(id);
        return filaMapper.toResponseDTO(fila);
    }

    @Override
    @Transactional(readOnly = true)
    public Fila findFilaById(UUID id) {
        return filaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fila não encontrada com o ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FilaResponseDTO> listarPorUnidade(UUID unidadeId) {
        UnidadeAtendimento unidade = unidadeService.findUnidadeById(unidadeId);

        return filaRepository.findByUnidadeAtendimento(unidade).stream()
                .map(filaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Fila> findBySetorId(UUID setorId) {
        Setor setor = setorService.findSetorById(setorId);
        return filaRepository.findBySetor(setor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FilaResponseDTO> listarTodas() {
        return filaRepository.findAll().stream()
                .map(filaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    private void validarNomeUnico(String nome, UnidadeAtendimento unidade, UUID idExcluido) {
        filaRepository.findByNomeAndUnidadeAtendimento(nome, unidade).ifPresent(fila -> {
            if (idExcluido == null || !fila.getId().equals(idExcluido)) {
                throw new BusinessException("Já existe uma fila com o nome '" + nome + "' nesta Unidade de Atendimento.");
            }
        });
    }
}