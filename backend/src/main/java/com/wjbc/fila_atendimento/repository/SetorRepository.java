package com.wjbc.fila_atendimento.repository;

import com.wjbc.fila_atendimento.domain.model.Setor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SetorRepository extends JpaRepository<Setor, UUID> {
}

