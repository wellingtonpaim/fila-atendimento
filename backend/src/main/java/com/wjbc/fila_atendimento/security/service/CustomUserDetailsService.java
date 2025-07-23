package com.wjbc.fila_atendimento.security.service;

import br.univesp.pi.domain.model.Usuario;
import br.univesp.pi.service.UsuarioService;
import br.univesp.pi.service.impl.UserDetailsImpl;
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
