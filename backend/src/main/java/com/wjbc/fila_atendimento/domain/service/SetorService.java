package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.model.Setor;

import java.util.List;
import java.util.UUID;

public interface SetorService {

    Setor salvar(Setor setor);
    Setor buscarPorId(UUID setorId);
    List<Setor> listarTodos();
    void deletar(UUID setorId);

}
