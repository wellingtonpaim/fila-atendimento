package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;

import java.util.List;
import java.util.UUID;

public interface UnidadeAtendimentoService {

    UnidadeAtendimento salvar(UnidadeAtendimento unidadeAtendimento);
    UnidadeAtendimento buscarPorId(UUID unidadeId);
    List<UnidadeAtendimento> listarTodas();
    void deletar(UUID unidadeId);

}
