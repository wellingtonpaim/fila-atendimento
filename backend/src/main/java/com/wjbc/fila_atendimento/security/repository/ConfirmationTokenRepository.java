package com.wjbc.fila_atendimento.security.repository;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.security.model.ConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {

    @Query(value = """
        SELECT ct.id, ct.token, ct.usuario_id, ct.expiry_date,
               u.id as user_id, u.nome_usuario, u.email, u.senha, u.categoria, u.ativo
        FROM fila_atendimento.confirmation_token ct 
        JOIN fila_atendimento.usuario u ON u.id = ct.usuario_id 
        WHERE ct.token = :token
        """, nativeQuery = true)
    Optional<Object[]> findTokenWithUserNative(@Param("token") String token);

    @Query("SELECT ct FROM ConfirmationToken ct WHERE ct.token = :token")
    Optional<ConfirmationToken> findByTokenOnly(@Param("token") String token);

    @Query(value = "SELECT * FROM fila_atendimento.confirmation_token WHERE token = :token", nativeQuery = true)
    Optional<ConfirmationToken> findByToken(@Param("token") String token);

    void deleteByUsuario(Usuario usuario);
}
