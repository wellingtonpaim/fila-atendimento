package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCancelamentoDTO;
import java.util.List;
import java.util.UUID;

public interface EntradaFilaService {
    EntradaFilaResponseDTO adicionarClienteAFila(EntradaFilaCreateDTO dto);
    EntradaFilaResponseDTO chamarProximo(UUID filaId, UUID usuarioId, String guiche);
    EntradaFilaResponseDTO finalizarAtendimento(UUID entradaFilaId);
    EntradaFilaResponseDTO cancelarAtendimento(UUID entradaFilaId, EntradaFilaCancelamentoDTO cancelamentoDTO);
    default EntradaFilaResponseDTO cancelarAtendimento(UUID entradaFilaId) {
        return cancelarAtendimento(entradaFilaId, new EntradaFilaCancelamentoDTO(null));
    }
    EntradaFilaResponseDTO encaminharParaFila(UUID entradaFilaIdOrigem, EntradaFilaCreateDTO dtoDestino);
    List<EntradaFilaResponseDTO> listarAguardandoPorFila(UUID filaId);
}
