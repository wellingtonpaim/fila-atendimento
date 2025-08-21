package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FilaRepository extends JpaRepository<Fila, UUID> {

    Optional<Fila> findByNomeAndUnidadeAtendimento(String nome, UnidadeAtendimento unidadeAtendimento);

    List<Fila> findByUnidadeAtendimento(UnidadeAtendimento unidadeAtendimento);

    boolean existsBySetorAndAtivaIsTrue(Setor setor);

    boolean existsByUnidadeAtendimentoAndAtivaIsTrue(UnidadeAtendimento unidadeAtendimento);

}