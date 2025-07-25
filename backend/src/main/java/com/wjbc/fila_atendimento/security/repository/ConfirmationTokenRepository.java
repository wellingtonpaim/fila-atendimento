package com.wjbc.fila_atendimento.security.repository;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.security.model.ConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {

    Optional<ConfirmationToken> findByToken(String token);
    void deleteByUsuario(Usuario usuario);
}
