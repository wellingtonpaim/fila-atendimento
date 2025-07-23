package com.wjbc.fila_atendimento.security.service;

import br.univesp.pi.domain.model.Usuario;
import br.univesp.pi.repository.UsuarioRepository;
import br.univesp.pi.security.enums.SECURITY_CONSTANTS;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JWTTokenService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public String generateToken(String username) {
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return JWT.create()
                .withSubject(username)
                .withClaim("roles", usuario.getCategoria().getRole())
                .withExpiresAt(new Date(System.currentTimeMillis() + SECURITY_CONSTANTS.EXPIRATION_TIME))
                .sign(Algorithm.HMAC512(SECURITY_CONSTANTS.SECRET.getBytes()));
    }
}