package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Setor;

import java.util.List;
import java.util.UUID;

public interface SetorService {
    SetorResponseDTO criar(SetorCreateDTO setorDTO);
    SetorResponseDTO substituir(UUID id, SetorCreateDTO setorDTO);
    SetorResponseDTO atualizarParcialmente(UUID id, SetorUpdateDTO setorDTO);
    SetorResponseDTO buscarPorId(UUID id);
    List<SetorResponseDTO> listarTodos();
    List<SetorResponseDTO> buscarPorNomeContendo(String nome);
    void desativar(UUID id);
    Setor findSetorById(UUID id);
}