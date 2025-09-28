package com.wjbc.fila_atendimento.security.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.security.service.AuthService;
import com.wjbc.fila_atendimento.security.service.JWTTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JWTTokenService jwtTokenService;
    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLoginSuccess() {
        UUID unidadeId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        usuario.setEmail("test@test.com");
        UnidadeAtendimento unidade = new UnidadeAtendimento();
        unidade.setId(unidadeId);
        usuario.setUnidades(Collections.singletonList(unidade));
        when(authService.findByEmail(anyString())).thenReturn(usuario);
        when(jwtTokenService.generateToken(anyString(), any(UUID.class))).thenReturn("token");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        ResponseEntity<ApiResponse<String>> response = authController.login("test@test.com", "senha", unidadeId);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("token", response.getBody().getData());
    }

    @Test
    void testLoginUserNotFound() {
        UUID unidadeId = UUID.randomUUID();
        when(authService.findByEmail(anyString())).thenReturn(null);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        ResponseEntity<ApiResponse<String>> response = authController.login("notfound@test.com", "senha", unidadeId);
        assertEquals(401, response.getStatusCode().value());
        assertEquals("Usuário não encontrado", response.getBody().getMessage());
    }

    @Test
    void testLoginAuthenticationException() {
        UUID unidadeId = UUID.randomUUID();
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(new BadCredentialsException("Credenciais inválidas"));
        ResponseEntity<ApiResponse<String>> response = authController.login("test@test.com", "senha", unidadeId);
        assertEquals(401, response.getStatusCode().value());
        assertEquals("Credenciais inválidas, verifique e tente novamente.", response.getBody().getMessage());
    }

    @Test
    void testRegisterSuccess() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("nome", "email@test.com", "senha", null, null);
        doNothing().when(authService).register(any(UsuarioCreateDTO.class));
        ResponseEntity<ApiResponse<String>> response = authController.register(dto);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("E-mail de confirmação enviado com sucesso!", response.getBody().getMessage());
    }

    @Test
    void testRegisterIllegalArgumentException() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("nome", "email@test.com", "senha", null, null);
        doThrow(new IllegalArgumentException("Erro de validação")).when(authService).register(any(UsuarioCreateDTO.class));
        ResponseEntity<ApiResponse<String>> response = authController.register(dto);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Erro de validação", response.getBody().getMessage());
    }

    @Test
    void testDeleteUserByEmailSuccess() {
        doNothing().when(authService).deleteUserByEmail(anyString());
        ResponseEntity<ApiResponse<Void>> response = authController.deleteUserByEmail("email@test.com");
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("excluído com sucesso"));
    }

    @Test
    void testDeleteUserByEmailIllegalArgumentException() {
        doThrow(new IllegalArgumentException("Usuário não encontrado")).when(authService).deleteUserByEmail(anyString());
        ResponseEntity<ApiResponse<Void>> response = authController.deleteUserByEmail("email@test.com");
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Usuário não encontrado", response.getBody().getMessage());
    }
}
