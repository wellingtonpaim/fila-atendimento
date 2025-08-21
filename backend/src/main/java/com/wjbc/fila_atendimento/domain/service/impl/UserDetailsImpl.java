package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserDetailsImpl implements UserDetails {

    private final Usuario usuario;

    public UserDetailsImpl(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Atribui a role baseada na categoria do usuário
        String role = usuario.getCategoria().getRole(); // Ex: ROLE_ADMINISTRADOR
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return usuario.getSenha(); // A senha deve estar criptografada com BCrypt
    }

    @Override
    public String getUsername() {
        return usuario.getEmail(); // O email está sendo usado como identificador de login
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Pode mudar se implementar lógica de expiração
    }

    @Override
    public boolean isAccountNonLocked() {
        return usuario.isAtivo(); // Considera inativo como conta bloqueada
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Pode mudar se quiser expirar senhas antigas
    }

    @Override
    public boolean isEnabled() {
        return usuario.isAtivo(); // Ativo após confirmação de email, por exemplo
    }
}
