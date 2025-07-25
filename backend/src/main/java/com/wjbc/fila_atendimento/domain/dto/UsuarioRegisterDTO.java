package com.wjbc.fila_atendimento.domain.dto;

import com.wjbc.fila_atendimento.validation.SenhaValida;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioRegisterDTO {

    @NotBlank(message = "Nome de usuário é obrigatório")
    private String nomeUsuario;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @SenhaValida
    private String senha;

    private String categoria = "USUARIO";
}