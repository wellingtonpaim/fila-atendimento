package com.wjbc.fila_atendimento.repository;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(@NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email);
}
