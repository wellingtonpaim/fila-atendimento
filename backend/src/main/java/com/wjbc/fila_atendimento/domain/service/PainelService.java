package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.PainelCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelResponseDTO;

import java.util.List;
import java.util.UUID;

public interface PainelService {
    PainelResponseDTO criar(PainelCreateDTO dto);
    PainelResponseDTO atualizar(UUID id, PainelUpdateDTO dto);
    PainelResponseDTO buscarPorId(UUID id, UUID unidadeAtendimentoId);
    List<PainelResponseDTO> listarTodos(UUID unidadeAtendimentoId);
    List<PainelResponseDTO> listarPorUnidade(UUID unidadeAtendimentoId);
    void desativar(UUID id);
}
