package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.FilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Fila;

import java.util.List;
import java.util.UUID;

public interface FilaService {
    FilaResponseDTO criar(FilaCreateDTO filaDTO);
    FilaResponseDTO atualizarParcialmente(UUID id, FilaUpdateDTO filaDTO);
    FilaResponseDTO buscarPorId(UUID id);
    List<FilaResponseDTO> listarPorUnidade(UUID unidadeId);
    void desativar(UUID id);
    Fila findFilaById(UUID id);
}
