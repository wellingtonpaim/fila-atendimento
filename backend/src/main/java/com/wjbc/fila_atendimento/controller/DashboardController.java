package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dashboard.dto.*;
import com.wjbc.fila_atendimento.domain.dashboard.service.DashboardService;
import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/tempo-medio-espera")
    public ResponseEntity<ApiResponse<List<TempoEsperaDTO>>> tempoMedioEspera(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<TempoEsperaDTO> lista = dashboardService.calcularTempoMedioEspera(unidadeId, inicio, fim);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tempo médio de espera calculado com sucesso", lista));
    }

    @GetMapping("/produtividade")
    public ResponseEntity<ApiResponse<List<ProdutividadeDTO>>> produtividade(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<ProdutividadeDTO> lista = dashboardService.calcularProdutividadePorProfissional(unidadeId, inicio, fim);
        return ResponseEntity.ok(new ApiResponse<>(true, "Produtividade calculada com sucesso", lista));
    }

    @GetMapping("/horarios-pico")
    public ResponseEntity<ApiResponse<List<HorarioPicoDTO>>> horariosPico(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<HorarioPicoDTO> lista = dashboardService.identificarHorariosPico(unidadeId, inicio, fim);
        return ResponseEntity.ok(new ApiResponse<>(true, "Horários de pico identificados com sucesso", lista));
    }

    @GetMapping("/fluxo-pacientes")
    public ResponseEntity<ApiResponse<List<FluxoPacientesDTO>>> fluxoPacientes(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<FluxoPacientesDTO> lista = dashboardService.analisarFluxoPacientes(unidadeId, inicio, fim);
        return ResponseEntity.ok(new ApiResponse<>(true, "Fluxo de pacientes analisado com sucesso", lista));
    }
}
