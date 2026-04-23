package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.CepResponseDTO;

public interface ViaCepService {
    CepResponseDTO buscarPorCep(String cep);
}
