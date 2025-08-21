package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.PainelCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelResponseDTO;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.model.Painel;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.PainelRepository;
import com.wjbc.fila_atendimento.domain.repository.UnidadeAtendimentoRepository;
import com.wjbc.fila_atendimento.domain.service.PainelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PainelServiceImpl implements PainelService {

    private final PainelRepository painelRepository;
    private final UnidadeAtendimentoRepository unidadeAtendimentoRepository;

    @Override
    @Transactional
    public PainelResponseDTO criar(PainelCreateDTO dto) {
        UnidadeAtendimento unidade = unidadeAtendimentoRepository.findById(dto.unidadeAtendimentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de atendimento não encontrada"));
        Painel painel = new Painel();
        painel.setDescricao(dto.descricao());
        painel.setUnidadeAtendimento(unidade);
        Painel salvo = painelRepository.save(painel);
        return toResponseDTO(salvo);
    }

    @Override
    @Transactional
    public PainelResponseDTO atualizar(UUID id, PainelUpdateDTO dto) {
        Painel painel = painelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Painel não encontrado"));
        UnidadeAtendimento unidade = unidadeAtendimentoRepository.findById(dto.unidadeAtendimentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de atendimento não encontrada"));
        painel.setDescricao(dto.descricao());
        painel.setUnidadeAtendimento(unidade);
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
        return painelRepository.findByUnidadeAtendimentoId(unidadeAtendimentoId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        Painel painel = painelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Painel não encontrado"));
        painelRepository.delete(painel);
    }

    private PainelResponseDTO toResponseDTO(Painel painel) {
        return new PainelResponseDTO(
                painel.getId(),
                painel.getDescricao(),
                painel.getUnidadeAtendimento().getId()
        );
    }
}
