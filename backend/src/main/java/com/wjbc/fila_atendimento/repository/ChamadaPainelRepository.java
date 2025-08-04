package com.wjbc.fila_atendimento.repository;

import com.wjbc.fila_atendimento.domain.model.ChamadaPainel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChamadaPainelRepository extends JpaRepository<ChamadaPainel, UUID> {
}

