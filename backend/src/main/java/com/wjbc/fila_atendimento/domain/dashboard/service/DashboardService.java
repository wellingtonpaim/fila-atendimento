package com.wjbc.fila_atendimento.domain.dashboard.service;

import com.wjbc.fila_atendimento.domain.dashboard.dto.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DashboardService {
    List<TempoEsperaDTO> calcularTempoMedioEspera(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
    List<ProdutividadeDTO> calcularProdutividadePorProfissional(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
    List<HorarioPicoDTO> identificarHorariosPico(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
    List<FluxoPacientesDTO> analisarFluxoPacientes(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim);
}

