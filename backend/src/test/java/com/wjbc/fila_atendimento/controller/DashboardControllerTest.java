package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dashboard.dto.FluxoPacientesDTO;
import com.wjbc.fila_atendimento.domain.dashboard.dto.HorarioPicoDTO;
import com.wjbc.fila_atendimento.domain.dashboard.dto.ProdutividadeDTO;
import com.wjbc.fila_atendimento.domain.dashboard.dto.TempoEsperaDTO;
import com.wjbc.fila_atendimento.domain.dashboard.service.DashboardService;
import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DashboardControllerTest {
    @Mock
    private DashboardService dashboardService;
    @InjectMocks
    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void tempoMedioEspera_sucesso() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        TempoEsperaDTO dto = new TempoEsperaDTO("Fila", "Setor", "Unidade", 10.0, inicio, fim);
        when(dashboardService.calcularTempoMedioEspera(unidadeId, inicio, fim)).thenReturn(List.of(dto));
        ResponseEntity<ApiResponse<List<TempoEsperaDTO>>> response = dashboardController.tempoMedioEspera(unidadeId, inicio, fim);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isEmpty());
    }

    @Test
    void tempoMedioEspera_erro() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        when(dashboardService.calcularTempoMedioEspera(unidadeId, inicio, fim)).thenThrow(new RuntimeException("Erro"));
        Exception exception = assertThrows(RuntimeException.class, () -> dashboardController.tempoMedioEspera(unidadeId, inicio, fim));
        assertEquals("Erro", exception.getMessage());
    }

    @Test
    void produtividade_sucesso() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        ProdutividadeDTO dto = new ProdutividadeDTO("Profissional", "Setor", "Unidade", 5L, 10.0);
        when(dashboardService.calcularProdutividadePorProfissional(unidadeId, inicio, fim)).thenReturn(List.of(dto));
        ResponseEntity<ApiResponse<List<ProdutividadeDTO>>> response = dashboardController.produtividade(unidadeId, inicio, fim);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isEmpty());
    }

    @Test
    void produtividade_erro() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        when(dashboardService.calcularProdutividadePorProfissional(unidadeId, inicio, fim)).thenThrow(new RuntimeException("Erro"));
        Exception exception = assertThrows(RuntimeException.class, () -> dashboardController.produtividade(unidadeId, inicio, fim));
        assertEquals("Erro", exception.getMessage());
    }

    @Test
    void horariosPico_sucesso() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        HorarioPicoDTO dto = new HorarioPicoDTO("Unidade", "Setor", inicio, 20L);
        when(dashboardService.identificarHorariosPico(unidadeId, inicio, fim)).thenReturn(List.of(dto));
        ResponseEntity<ApiResponse<List<HorarioPicoDTO>>> response = dashboardController.horariosPico(unidadeId, inicio, fim);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isEmpty());
    }

    @Test
    void horariosPico_erro() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        when(dashboardService.identificarHorariosPico(unidadeId, inicio, fim)).thenThrow(new RuntimeException("Erro"));
        Exception exception = assertThrows(RuntimeException.class, () -> dashboardController.horariosPico(unidadeId, inicio, fim));
        assertEquals("Erro", exception.getMessage());
    }

    @Test
    void fluxoPacientes_sucesso() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        FluxoPacientesDTO dto = new FluxoPacientesDTO("Unidade", "Origem", "Destino", 100L);
        when(dashboardService.analisarFluxoPacientes(unidadeId, inicio, fim)).thenReturn(List.of(dto));
        ResponseEntity<ApiResponse<List<FluxoPacientesDTO>>> response = dashboardController.fluxoPacientes(unidadeId, inicio, fim);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isEmpty());
    }

    @Test
    void fluxoPacientes_erro() {
        UUID unidadeId = UUID.randomUUID();
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fim = LocalDateTime.now();
        when(dashboardService.analisarFluxoPacientes(unidadeId, inicio, fim)).thenThrow(new RuntimeException("Erro"));
        Exception exception = assertThrows(RuntimeException.class, () -> dashboardController.fluxoPacientes(unidadeId, inicio, fim));
        assertEquals("Erro", exception.getMessage());
    }
}
