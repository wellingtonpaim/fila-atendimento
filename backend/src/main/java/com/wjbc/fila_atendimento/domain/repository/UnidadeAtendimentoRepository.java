package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UnidadeAtendimentoRepository extends JpaRepository<UnidadeAtendimento, UUID> {
}

