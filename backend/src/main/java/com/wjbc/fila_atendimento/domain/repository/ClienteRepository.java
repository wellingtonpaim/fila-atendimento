package com.wjbc.fila_atendimento.domain.repository;

import com.wjbc.fila_atendimento.domain.model.Cliente;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, UUID>, JpaSpecificationExecutor<Cliente> {

    Optional<Cliente> findByCpf(String cpf);

    // Versões para paginação direta (caso necessário em outros pontos)
    Page<Cliente> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    Page<Cliente> findDistinctByTelefonesNumeroContaining(String numero, Pageable pageable);

    // Versões alinhadas ao padrão listarTodos: retornam List e deixam o Controller paginar opcionalmente
    List<Cliente> findByEmailContainingIgnoreCase(String email);

    @Query("SELECT DISTINCT c FROM Cliente c JOIN c.telefones t " +
           "WHERE str(t.numero) LIKE CONCAT('%', :telefone, '%') " +
           "   OR str(t.ddd) LIKE CONCAT('%', :telefone, '%') " +
           "   OR CONCAT(str(t.ddd), str(t.numero)) LIKE CONCAT('%', :telefone, '%')")
    List<Cliente> searchByTelefoneContaining(@Param("telefone") String telefone);

}