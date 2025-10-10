package com.wjbc.fila_atendimento.security.repository;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.security.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.token = :token")
    Optional<PasswordResetToken> findByToken(@Param("token") String token);

    void deleteByUsuario(Usuario usuario);
}

