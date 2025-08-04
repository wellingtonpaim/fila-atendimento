package com.wjbc.fila_atendimento.repository;

import com.wjbc.fila_atendimento.domain.model.Fila;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FilaRepository extends JpaRepository<Fila, UUID> {
}
