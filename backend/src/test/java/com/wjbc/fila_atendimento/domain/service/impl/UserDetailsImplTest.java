package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsImplTest {
    private Usuario usuarioAtivo;
    private Usuario usuarioInativo;

    @BeforeEach
    void setUp() {
        usuarioAtivo = new Usuario();
        usuarioAtivo.setCategoria(CategoriaUsuario.ADMINISTRADOR);
        usuarioAtivo.setSenha("senha123");
        usuarioAtivo.setEmail("teste@email.com");
        usuarioAtivo.setAtivo(true);

        usuarioInativo = new Usuario();
        usuarioInativo.setCategoria(CategoriaUsuario.ADMINISTRADOR);
        usuarioInativo.setSenha("senha456");
        usuarioInativo.setEmail("inativo@email.com");
        usuarioInativo.setAtivo(false);
    }

    @Test
    void testGetAuthorities() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        assertEquals(1, authorities.size());
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR")));
    }

    @Test
    void testGetPassword() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        assertEquals("senha123", userDetails.getPassword());
    }

    @Test
    void testGetUsername() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        assertEquals("teste@email.com", userDetails.getUsername());
    }

    @Test
    void testIsAccountNonExpired() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        assertTrue(userDetails.isAccountNonExpired());
    }

    @Test
    void testIsAccountNonLocked_Ativo() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        assertTrue(userDetails.isAccountNonLocked());
    }

    @Test
    void testIsAccountNonLocked_Inativo() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioInativo);
        assertFalse(userDetails.isAccountNonLocked());
    }

    @Test
    void testIsCredentialsNonExpired() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        assertTrue(userDetails.isCredentialsNonExpired());
    }

    @Test
    void testIsEnabled_Ativo() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioAtivo);
        assertTrue(userDetails.isEnabled());
    }

    @Test
    void testIsEnabled_Inativo() {
        UserDetailsImpl userDetails = new UserDetailsImpl(usuarioInativo);
        assertFalse(userDetails.isEnabled());
    }
}
