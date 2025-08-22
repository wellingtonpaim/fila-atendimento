package com.wjbc.fila_atendimento.domain.dashboard.repository.impl;

import com.wjbc.fila_atendimento.domain.dashboard.dto.*;
import com.wjbc.fila_atendimento.domain.dashboard.repository.DashboardRepository;
import com.wjbc.fila_atendimento.domain.dashboard.repository.query.DashboardQueries;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class DashboardRepositoryImpl implements DashboardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<TempoEsperaDTO> buscarTempoMedioEspera(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        Query query = entityManager.createNativeQuery(DashboardQueries.TEMPO_ESPERA);
        query.setParameter("unidadeId", unidadeId);
        query.setParameter("inicio", inicio);
        query.setParameter("fim", fim);
        List<Object[]> result = query.getResultList();
        return result.stream().map(row -> new TempoEsperaDTO(
                (String) row[0], (String) row[1], (String) row[2],
                row[3] != null ? ((Number) row[3]).doubleValue() : null,
                (row[4] instanceof java.sql.Timestamp ? ((java.sql.Timestamp) row[4]).toLocalDateTime() : null),
                (row[5] instanceof java.sql.Timestamp ? ((java.sql.Timestamp) row[5]).toLocalDateTime() : null)
        )).toList();
    }

    @Override
    public List<ProdutividadeDTO> buscarProdutividadePorProfissional(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        Query query = entityManager.createNativeQuery(DashboardQueries.PRODUTIVIDADE);
        query.setParameter("unidadeId", unidadeId);
        query.setParameter("inicio", inicio);
        query.setParameter("fim", fim);
        List<Object[]> result = query.getResultList();
        return result.stream().map(row -> new ProdutividadeDTO(
                (String) row[0], (String) row[1], (String) row[2],
                ((Number) row[3]).longValue(),
                row[4] != null ? ((Number) row[4]).doubleValue() : null
        )).toList();
    }

    @Override
    public List<HorarioPicoDTO> buscarHorariosPico(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        Query query = entityManager.createNativeQuery(DashboardQueries.HORARIO_PICO);
        query.setParameter("unidadeId", unidadeId);
        query.setParameter("inicio", inicio);
        query.setParameter("fim", fim);
        List<Object[]> result = query.getResultList();
        return result.stream().map(row -> new HorarioPicoDTO(
                (String) row[0], (String) row[1],
                (row[2] instanceof java.sql.Timestamp ? ((java.sql.Timestamp) row[2]).toLocalDateTime() : null),
                ((Number) row[3]).longValue()
        )).toList();
    }

    @Override
    public List<FluxoPacientesDTO> buscarFluxoPacientes(UUID unidadeId, LocalDateTime inicio, LocalDateTime fim) {
        Query query = entityManager.createNativeQuery(DashboardQueries.FLUXO_PACIENTES);
        query.setParameter("unidadeId", unidadeId);
        query.setParameter("inicio", inicio);
        query.setParameter("fim", fim);
        List<Object[]> result = query.getResultList();
        return result.stream().map(row -> new FluxoPacientesDTO(
                (String) row[0], (String) row[1], null, ((Number) row[2]).longValue()
        )).toList();
    }
}
