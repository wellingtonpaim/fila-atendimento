package com.wjbc.fila_atendimento.security.controller;

import com.wjbc.fila_atendimento.security.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;
import org.springframework.web.servlet.ModelAndView;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;

class AuthViewControllerTest {

    @Mock
    private AuthService authService;

    private AuthViewController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new AuthViewController(authService);
    }

    @Test
    void confirmar_deveRetornarHtmlComSucesso() {
        doNothing().when(authService).confirmEmail(anyString());
        Model model = new ExtendedModelMap();

        ModelAndView mv = controller.confirmar("token-ok", model);

        assertEquals("auth/confirmacao-resultado", mv.getViewName());
        assertTrue((Boolean) model.getAttribute("success"));
        assertEquals("E-mail confirmado com sucesso!", model.getAttribute("message"));
        assertNotNull(model.getAttribute("timestamp"));
        assertNotNull(model.getAttribute("year"));
    }

    @Test
    void confirmar_deveRetornarHtmlComMensagemDeErro() {
        doThrow(new IllegalArgumentException("Token inválido")).when(authService).confirmEmail(anyString());
        Model model = new ExtendedModelMap();

        ModelAndView mv = controller.confirmar("token-erro", model);

        assertEquals("auth/confirmacao-resultado", mv.getViewName());
        assertFalse((Boolean) model.getAttribute("success"));
        assertEquals("Token inválido", model.getAttribute("message"));
    }
}

