package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import com.wjbc.fila_atendimento.domain.model.EntradaFila;
import com.wjbc.fila_atendimento.domain.model.Fila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EntradaFilaRepository extends JpaRepository<EntradaFila, UUID> {

    boolean existsByFilaAndStatus(Fila fila, StatusFila status);

}

