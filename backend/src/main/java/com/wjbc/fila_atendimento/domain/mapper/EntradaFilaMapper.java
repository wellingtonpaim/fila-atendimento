package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.model.EntradaFila;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EntradaFilaMapper {

    private final ClienteMapper clienteMapper;
    private final FilaMapper filaMapper;

    public EntradaFilaResponseDTO toResponseDTO(EntradaFila entradaFila) {
        return new EntradaFilaResponseDTO(
                entradaFila.getId(),
                entradaFila.getStatus(),
                entradaFila.getPrioridade(),
                entradaFila.isRetorno(),
                entradaFila.getDataHoraEntrada(),
                entradaFila.getDataHoraChamada(),
                entradaFila.getDataHoraSaida(),
                entradaFila.getGuicheOuSalaAtendimento(),
                clienteMapper.toResponseDTO(entradaFila.getCliente()),
                filaMapper.toResponseDTO(entradaFila.getFila()),
                entradaFila.getUsuarioResponsavel() != null ? entradaFila.getUsuarioResponsavel().getId() : null
        );
    }
}
