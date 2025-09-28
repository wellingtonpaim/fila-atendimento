package com.wjbc.fila_atendimento.security.controller;

import com.wjbc.fila_atendimento.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthViewController {

    private final AuthService authService;

    @Value("${app.qmanager.login-url:http://localhost:3000/login}")
    private String qmanagerLoginUrl;

    @Value("${app.qmanager.error-url:http://localhost:3000/login?retry=true}")
    private String qmanagerErrorUrl;

    @GetMapping(value = "/confirmar", produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView confirmar(@RequestParam String token, Model model) {
        String view = "auth/confirmacao-resultado";
        boolean success = false;
        String message;
        try {
            authService.confirmEmail(token);
            success = true;
            message = "E-mail confirmado com sucesso!";
        } catch (IllegalArgumentException | IllegalStateException e) {
            message = e.getMessage();
        }

        String loginUrl = (qmanagerLoginUrl == null || qmanagerLoginUrl.isBlank()) ? "http://localhost:3000/login" : qmanagerLoginUrl;
        String errorUrl = (qmanagerErrorUrl == null || qmanagerErrorUrl.isBlank()) ? "http://localhost:3000/login?retry=true" : qmanagerErrorUrl;
        String base = success ? loginUrl : errorUrl;

        String sep = base.contains("?") ? "&" : "?";
        String qmanagerTargetUrl = base + sep +
                "utm_source=qmanager-backend" +
                "&utm_medium=confirm-email-page" +
                "&utm_campaign=signup_confirmation" +
                "&utm_content=" + (success ? "success" : "error");
        String buttonText = success ? "Ir para Q-Manager" : "Tentar novamente";

        model.addAttribute("success", success);
        model.addAttribute("message", message);
        model.addAttribute("timestamp", OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        model.addAttribute("year", String.valueOf(OffsetDateTime.now().getYear()));
        model.addAttribute("qmanagerTargetUrl", qmanagerTargetUrl);
        model.addAttribute("buttonText", buttonText);
        return new ModelAndView(view);
    }
}
