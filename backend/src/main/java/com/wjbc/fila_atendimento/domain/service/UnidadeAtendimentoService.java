package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;

import java.util.List;
import java.util.UUID;

public interface UnidadeAtendimentoService {
    UnidadeAtendimentoResponseDTO criar(UnidadeAtendimentoCreateDTO unidadeDTO);
    UnidadeAtendimentoResponseDTO substituir(UUID id, UnidadeAtendimentoCreateDTO unidadeDTO);
    UnidadeAtendimentoResponseDTO atualizarParcialmente(UUID id, UnidadeAtendimentoUpdateDTO unidadeDTO);
    UnidadeAtendimentoResponseDTO buscarPorId(UUID id);
    List<UnidadeAtendimentoResponseDTO> listarTodas();
    List<UnidadeAtendimentoResponseDTO> buscarPorNomeContendo(String nome);
    void desativar(UUID id);
    UnidadeAtendimento findUnidadeById(UUID id);
}