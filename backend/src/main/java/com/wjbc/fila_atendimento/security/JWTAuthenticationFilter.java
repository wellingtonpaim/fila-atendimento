package com.wjbc.fila_atendimento.security;

import br.univesp.pi.security.enums.SECURITY_CONSTANTS;
import br.univesp.pi.security.service.CustomUserDetailsService;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;

    public JWTAuthenticationFilter(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = request.getHeader(SECURITY_CONSTANTS.HEADER_STRING);

        if (token != null && token.startsWith(SECURITY_CONSTANTS.TOKEN_PREFIX)) {
            try {
                String username = JWT.require(Algorithm.HMAC512(SECURITY_CONSTANTS.SECRET.getBytes()))
                        .build()
                        .verify(token.replace(SECURITY_CONSTANTS.TOKEN_PREFIX, ""))
                        .getSubject();

                if (username != null) {
                    // Carrega as roles do usuário
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JWTVerificationException e) {
                logger.debug("Token inválido: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}