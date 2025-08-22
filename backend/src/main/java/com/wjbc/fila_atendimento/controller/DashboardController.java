package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dashboard.dto.*;
import com.wjbc.fila_atendimento.domain.dashboard.service.DashboardService;
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
    public ResponseEntity<List<TempoEsperaDTO>> tempoMedioEspera(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(dashboardService.calcularTempoMedioEspera(unidadeId, inicio, fim));
    }

    @GetMapping("/produtividade")
    public ResponseEntity<List<ProdutividadeDTO>> produtividade(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(dashboardService.calcularProdutividadePorProfissional(unidadeId, inicio, fim));
    }

    @GetMapping("/horarios-pico")
    public ResponseEntity<List<HorarioPicoDTO>> horariosPico(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(dashboardService.identificarHorariosPico(unidadeId, inicio, fim));
    }

    @GetMapping("/fluxo-pacientes")
    public ResponseEntity<List<FluxoPacientesDTO>> fluxoPacientes(
            @RequestParam UUID unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(dashboardService.analisarFluxoPacientes(unidadeId, inicio, fim));
    }
}

