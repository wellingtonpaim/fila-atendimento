package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.Painel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PainelRepository extends JpaRepository<Painel, UUID> {
}

