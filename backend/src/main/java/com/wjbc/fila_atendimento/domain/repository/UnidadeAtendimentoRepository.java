package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnidadeAtendimentoRepository extends JpaRepository<UnidadeAtendimento, UUID> {

    Optional<UnidadeAtendimento> findByNome(String nome);

    List<UnidadeAtendimento> findByNomeContainingIgnoreCase(String nome);
}