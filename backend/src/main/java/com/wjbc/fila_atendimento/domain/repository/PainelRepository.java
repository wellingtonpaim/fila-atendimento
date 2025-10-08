package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.Painel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PainelRepository extends JpaRepository<Painel, UUID> {
    Optional<Painel> findById(UUID id);
    List<Painel> findByUnidadeAtendimentoId(UUID unidadeAtendimentoId);

    @Query("SELECT p FROM Painel p JOIN p.filas f WHERE f.id = :filaId")
    List<Painel> findPaineisByFilaId(@Param("filaId") UUID filaId);
}

