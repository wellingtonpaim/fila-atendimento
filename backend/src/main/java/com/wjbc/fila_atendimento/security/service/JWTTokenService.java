package com.wjbc.fila_atendimento.security.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.repository.UsuarioRepository;
import com.wjbc.fila_atendimento.security.enums.SECURITY_CONSTANTS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.UUID;

@Service
public class JWTTokenService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public String generateToken(String username, UUID unidadeAtendimentoId) {
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return JWT.create()
                .withSubject(username)
                .withClaim("roles", usuario.getCategoria().getRole())
                .withClaim("unidadeId", Collections.singletonList(unidadeAtendimentoId))
                .withExpiresAt(new Date(System.currentTimeMillis() + SECURITY_CONSTANTS.EXPIRATION_TIME))
                .sign(Algorithm.HMAC512(SECURITY_CONSTANTS.SECRET.getBytes()));
    }
}