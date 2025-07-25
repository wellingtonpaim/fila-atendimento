package com.wjbc.fila_atendimento.service;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public interface UsuarioService {

    Usuario salvarUsuario(Usuario usuario);

    Usuario findByEmail(@NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email);

    void deletarUsuario(Long id);
}
