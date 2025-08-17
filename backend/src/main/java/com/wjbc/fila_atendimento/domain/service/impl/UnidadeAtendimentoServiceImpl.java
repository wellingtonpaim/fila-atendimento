package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.UnidadeAtendimentoRepository;
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UnidadeAtendimentoServiceImpl implements UnidadeAtendimentoService {

    private final UnidadeAtendimentoRepository unidadeAtendimentoRepository;

    public UnidadeAtendimentoServiceImpl(UnidadeAtendimentoRepository unidadeAtendimentoRepository) {
        this.unidadeAtendimentoRepository = unidadeAtendimentoRepository;
    }

    @Override
    @Transactional
    public UnidadeAtendimento salvar(UnidadeAtendimento unidadeAtendimento) {
        // Validações de negócio poderiam ser adicionadas aqui antes de salvar
        return unidadeAtendimentoRepository.save(unidadeAtendimento);
    }

    @Override
    @Transactional(readOnly = true) // Otimização para operações de apenas leitura
    public UnidadeAtendimento buscarPorId(UUID unidadeId) {
        return unidadeAtendimentoRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de Atendimento não encontrada com o ID: " + unidadeId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnidadeAtendimento> listarTodas() {
        return unidadeAtendimentoRepository.findAll();
    }

    @Override
    @Transactional
    public void deletar(UUID unidadeId) {
        // Primeiro, verificamos se a unidade existe antes de tentar deletar
        UnidadeAtendimento unidade = buscarPorId(unidadeId);
        // Regras de negócio para deleção poderiam ser adicionadas aqui
        // Ex: verificar se a unidade não tem filas ativas antes de permitir a exclusão
        unidadeAtendimentoRepository.delete(unidade);
    }
}
