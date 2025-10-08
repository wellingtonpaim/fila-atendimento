package com.wjbc.fila_atendimento.domain.dashboard.service.impl;

import com.wjbc.fila_atendimento.domain.dashboard.dto.*;
import com.wjbc.fila_atendimento.domain.dashboard.repository.DashboardRepository;
import com.wjbc.fila_atendimento.domain.dashboard.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardServiceImpl(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    @Override
    public List<TempoEsperaDTO> calcularTempoMedioEspera(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        List<TempoEsperaDTO> result = dashboardRepository.buscarTempoMedioEspera(unidadeId, inicio, fim);
        return result;
    }

    @Override
    public List<ProdutividadeDTO> calcularProdutividadePorProfissional(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        List<ProdutividadeDTO> result = dashboardRepository.buscarProdutividadePorProfissional(unidadeId, inicio, fim);
        return result;
    }

    @Override
    public List<HorarioPicoDTO> identificarHorariosPico(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        List<HorarioPicoDTO> result = dashboardRepository.buscarHorariosPico(unidadeId, inicio, fim);
        return result;
    }

    @Override
    public List<FluxoPacientesDTO> analisarFluxoPacientes(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        List<FluxoPacientesDTO> result = dashboardRepository.buscarFluxoPacientes(unidadeId, inicio, fim);
        return result;
    }
}
