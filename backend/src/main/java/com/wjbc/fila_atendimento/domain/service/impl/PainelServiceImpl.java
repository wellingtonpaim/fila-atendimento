package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.PainelCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelResponseDTO;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Painel;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.FilaRepository;
import com.wjbc.fila_atendimento.domain.repository.PainelRepository;
import com.wjbc.fila_atendimento.domain.repository.UnidadeAtendimentoRepository;
import com.wjbc.fila_atendimento.domain.service.PainelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PainelServiceImpl implements PainelService {

    private final PainelRepository painelRepository;
    private final UnidadeAtendimentoRepository unidadeAtendimentoRepository;
    private final FilaRepository filaRepository;

    @Override
    @Transactional
    public PainelResponseDTO criar(PainelCreateDTO dto) {
        UnidadeAtendimento unidade = findUnidadeById(dto.unidadeAtendimentoId());

        Painel painel = new Painel();
        painel.setDescricao(dto.descricao());
        painel.setUnidadeAtendimento(unidade);

        if (dto.filasIds() != null && !dto.filasIds().isEmpty()) {
            List<Fila> filas = filaRepository.findAllById(dto.filasIds());
            painel.setFilas(filas);
        } else {
            painel.setFilas(Collections.emptyList());
        }

        Painel salvo = painelRepository.save(painel);
        return toResponseDTO(salvo);
    }

    @Override
    @Transactional
    public PainelResponseDTO atualizar(UUID id, PainelUpdateDTO dto) {
        Painel painel = findPainelById(id);
        UnidadeAtendimento unidade = findUnidadeById(dto.unidadeAtendimentoId());

        painel.setDescricao(dto.descricao());
        painel.setUnidadeAtendimento(unidade);

        if (dto.filasIds() != null) {
            List<Fila> filas = filaRepository.findAllById(dto.filasIds());
            painel.setFilas(filas);
        } else {
            painel.setFilas(Collections.emptyList());
        }

        Painel atualizado = painelRepository.save(painel);
        return toResponseDTO(atualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public PainelResponseDTO buscarPorId(UUID id, UUID unidadeAtendimentoId) {
        Painel painel = painelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Painel não encontrado"));
        if (!painel.getUnidadeAtendimento().getId().equals(unidadeAtendimentoId)) {
            throw new ResourceNotFoundException("Painel não pertence à unidade informada");
        }
        return toResponseDTO(painel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PainelResponseDTO> listarTodos(UUID unidadeAtendimentoId) {
        return painelRepository.findByUnidadeAtendimentoId(unidadeAtendimentoId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PainelResponseDTO> listarPorUnidade(UUID unidadeAtendimentoId) {
        findUnidadeById(unidadeAtendimentoId);
        return painelRepository.findByUnidadeAtendimentoId(unidadeAtendimentoId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        Painel painel = findPainelById(id);
        painelRepository.delete(painel);
    }

    @Override
    @Transactional
    public PainelResponseDTO adicionarFilaAoPainel(UUID painelId, UUID filaId) {
        Painel painel = findPainelById(painelId);
        Fila fila = findFilaById(filaId);

        if (painel.getFilas().stream().anyMatch(f -> f.getId().equals(filaId))) {
            throw new BusinessException("Fila já está vinculada a este painel.");
        }

        painel.getFilas().add(fila);
        Painel salvo = painelRepository.save(painel);
        return toResponseDTO(salvo);
    }

    @Override
    @Transactional
    public PainelResponseDTO removerFilaDoPainel(UUID painelId, UUID filaId) {
        Painel painel = findPainelById(painelId);

        boolean removed = painel.getFilas().removeIf(f -> f.getId().equals(filaId));
        if (!removed) {
            throw new ResourceNotFoundException("Fila com ID " + filaId + " não encontrada neste painel.");
        }

        Painel salvo = painelRepository.save(painel);
        return toResponseDTO(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public PainelResponseDTO buscarPublico(UUID id) {
        Painel painel = findPainelById(id);
        return toResponseDTO(painel);
    }

    // Métodos auxiliares
    private UnidadeAtendimento findUnidadeById(UUID id) {
        return unidadeAtendimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de atendimento não encontrada com o ID: " + id));
    }

    private Painel findPainelById(UUID id) {
        return painelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Painel não encontrado com o ID: " + id));
    }

    private Fila findFilaById(UUID id) {
        return filaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fila não encontrada com o ID: " + id));
    }

    private PainelResponseDTO toResponseDTO(Painel painel) {
        List<UUID> filasIds = painel.getFilas() != null ?
                painel.getFilas().stream().map(Fila::getId).collect(Collectors.toList()) :
                new ArrayList<>();

        return new PainelResponseDTO(
                painel.getId(),
                painel.getDescricao(),
                painel.getUnidadeAtendimento().getId(),
                filasIds
        );
    }

}
