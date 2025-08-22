package com.wjbc.fila_atendimento.domain.dashboard.repository;

import com.wjbc.fila_atendimento.domain.dashboard.dto.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DashboardRepository {
    List<TempoEsperaDTO> buscarTempoMedioEspera(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
    List<ProdutividadeDTO> buscarProdutividadePorProfissional(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
    List<HorarioPicoDTO> buscarHorariosPico(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
    List<FluxoPacientesDTO> buscarFluxoPacientes(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
}

