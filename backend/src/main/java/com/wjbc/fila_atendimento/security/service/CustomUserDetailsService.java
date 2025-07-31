package com.wjbc.fila_atendimento.security.service;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.service.UsuarioService;
import com.wjbc.fila_atendimento.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioService usuarioService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioService.findByEmail(username);

        if (usuario == null)
            throw new UsernameNotFoundException("Usuário não encontrado");

        return new UserDetailsImpl(usuario);
    }
}
