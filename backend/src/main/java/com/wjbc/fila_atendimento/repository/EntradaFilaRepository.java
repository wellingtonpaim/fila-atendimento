package com.wjbc.fila_atendimento.repository;

import com.wjbc.fila_atendimento.domain.model.EntradaFila;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EntradaFilaRepository extends JpaRepository<EntradaFila, UUID> {
}

