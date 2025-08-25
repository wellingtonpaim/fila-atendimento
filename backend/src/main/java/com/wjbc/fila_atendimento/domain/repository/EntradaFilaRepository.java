package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.Cliente;
import com.wjbc.fila_atendimento.domain.model.EntradaFila;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EntradaFilaRepository extends JpaRepository<EntradaFila, UUID> {

    // Verifica se um cliente já está AGUARDANDO numa fila específica
    boolean existsByClienteAndFilaAndStatus(Cliente cliente, Fila fila, StatusFila status);

    // Busca a lista de espera de uma fila, ordenada corretamente
    List<EntradaFila> findByFilaAndStatusOrderByPrioridadeDescDataHoraEntradaAsc(Fila fila, StatusFila status);

    // Busca o PRÓXIMO cliente a ser chamado numa fila (com ou sem a condição de retorno)
    Optional<EntradaFila> findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
            Fila fila, StatusFila status, boolean isRetorno
    );

    // Metodo da validação de desativação
    boolean existsByFilaAndStatus(Fila fila, StatusFila status);

    // Busca o chamado mais recente (atual) por fila e status
    Optional<EntradaFila> findFirstByFilaAndStatusOrderByDataHoraChamadaDesc(Fila fila, StatusFila status);

    // Busca os 3 chamados mais recentes por fila e status
    List<EntradaFila> findTop3ByFilaAndStatusOrderByDataHoraChamadaDesc(Fila fila, StatusFila status);
}