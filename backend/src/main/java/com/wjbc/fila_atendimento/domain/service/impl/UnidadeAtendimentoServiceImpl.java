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
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnidadeAtendimentoServiceImpl implements UnidadeAtendimentoService {

    private final UnidadeAtendimentoRepository unidadeRepository;
    private final UnidadeAtendimentoMapper unidadeMapper;
    private final FilaRepository filaRepository;

    @Override
    @Transactional
    public UnidadeAtendimentoResponseDTO criar(UnidadeAtendimentoCreateDTO unidadeDTO) {
        validarNome(unidadeDTO.nome(), null);
        UnidadeAtendimento unidade = unidadeMapper.toEntity(unidadeDTO);
        unidade.setAtivo(true);
        return unidadeMapper.toResponseDTO(unidadeRepository.save(unidade));
    }

    @Override
    @Transactional
    public UnidadeAtendimentoResponseDTO substituir(UUID id, UnidadeAtendimentoCreateDTO unidadeDTO) {
        UnidadeAtendimento unidadeExistente = findUnidadeById(id);
        validarNome(unidadeDTO.nome(), id);

        unidadeExistente.setNome(unidadeDTO.nome());
        unidadeExistente.setEndereco(unidadeDTO.endereco());
        unidadeExistente.setTelefones(unidadeDTO.telefones());

        return unidadeMapper.toResponseDTO(unidadeRepository.save(unidadeExistente));
    }

    @Override
    @Transactional
    public UnidadeAtendimentoResponseDTO atualizarParcialmente(UUID id, UnidadeAtendimentoUpdateDTO unidadeDTO) {
        UnidadeAtendimento unidadeExistente = findUnidadeById(id);
        unidadeMapper.applyPatchToEntity(unidadeDTO, unidadeExistente);
        validarNome(unidadeExistente.getNome(), id);
        return unidadeMapper.toResponseDTO(unidadeRepository.save(unidadeExistente));
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        UnidadeAtendimento unidade = findUnidadeById(id);
        if (filaRepository.existsByUnidadeAtendimentoAndAtivaIsTrue(unidade)) {
            throw new BusinessException("Unidade não pode ser desativada pois possui filas ativas.");
        }
        unidadeRepository.delete(unidade);
    }

    @Override
    @Transactional(readOnly = true)
    public UnidadeAtendimentoResponseDTO buscarPorId(UUID id) {
        return unidadeMapper.toResponseDTO(findUnidadeById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnidadeAtendimentoResponseDTO> listarTodas() {
        return unidadeRepository.findAll().stream()
                .map(unidadeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnidadeAtendimentoResponseDTO> buscarPorNomeContendo(String nome) {
        return unidadeRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(unidadeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UnidadeAtendimento findUnidadeById(UUID id) {
        return unidadeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de Atendimento não encontrada com o ID: " + id));
    }

    private void validarNome(String nome, UUID idExcluido) {
        unidadeRepository.findByNome(nome).ifPresent(unidade -> {
            if (idExcluido == null || !unidade.getId().equals(idExcluido)) {
                throw new BusinessException("Já existe uma Unidade de Atendimento cadastrada com o nome: " + nome);
            }
        });
    }
}