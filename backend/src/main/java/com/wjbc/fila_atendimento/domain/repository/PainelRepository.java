package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.Painel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PainelRepository extends JpaRepository<Painel, UUID> {
}

