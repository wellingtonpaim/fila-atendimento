package com.wjbc.fila_atendimento.security;

import com.wjbc.fila_atendimento.security.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    /**
     * Origens CORS permitidas. Configure via variável de ambiente CORS_ALLOWED_ORIGINS.
     * Padrão: permite todas as origens (adequado para estudo com nginx como proxy único).
     * Exemplo de valor: "https://203.0.113.1,http://localhost:8080"
     */
    @Value("${CORS_ALLOWED_ORIGINS:*}")
    private String corsAllowedOrigins;

    public WebSecurityConfig(@Lazy CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authManagerBuilder =
            http.getSharedObject(AuthenticationManagerBuilder.class);
        authManagerBuilder
                .userDetailsService(customUserDetailsService)
                .passwordEncoder(passwordEncoder());
        return authManagerBuilder.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Permitir preflight CORS sem autenticação
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Endpoints públicos REST
                        .requestMatchers("/auth/login", "/auth/confirmar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/forgot-password", "/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/reset-password/validate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/unidades-atendimento/public/login").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Handshake WebSocket/SockJS precisa ser público; autenticação real acontece no frame CONNECT via header Authorization (interceptor)
                        .requestMatchers("/ws/**").permitAll()
                        // Regras autenticadas
                        .requestMatchers(HttpMethod.GET, "/**").hasAnyRole("USUARIO", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.POST, "/**").hasAnyRole("USUARIO", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/usuarios/*/promover").hasRole("ADMINISTRADOR")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        new JWTAuthenticationFilter(customUserDetailsService),
                        UsernamePasswordAuthenticationFilter.class
                )
                .exceptionHandling(exc -> exc
                        .authenticationEntryPoint(new JWTAuthenticationEntryPoint())
                );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Origens lidas da variável de ambiente CORS_ALLOWED_ORIGINS (separadas por vírgula).
        // Em produção com nginx, frontend e backend compartilham mesma origem — CORS não se aplica.
        List<String> origins = List.of(corsAllowedOrigins.split(","));
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Permitir todos os headers em desenvolvimento para evitar bloqueios por CORS (ex.: x-unidade-id)
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Authorization", "X-Total-Count", "X-Total-Pages", "X-Page", "X-Page-Size", "Content-Range"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}