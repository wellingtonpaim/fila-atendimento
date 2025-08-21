package com.wjbc.fila_atendimento.security.controller;

import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.security.service.AuthService;
import com.wjbc.fila_atendimento.security.service.JWTTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JWTTokenService jwtTokenService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam UUID unidadeAtendimentoId
    ) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            Usuario usuario = authService.findByEmail(username);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não encontrado");
            }
            boolean temAcesso = usuario.getUnidades() != null && usuario.getUnidades().stream()
                    .anyMatch(u -> u.getId().equals(unidadeAtendimentoId));

            if (!temAcesso) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Usuário não tem acesso a esta unidade");
            }

            String token = jwtTokenService.generateToken(username, unidadeAtendimentoId);
            return ResponseEntity.ok(token);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UsuarioCreateDTO dto) {
        try {
            authService.register(dto);
            return ResponseEntity.ok("E-mail de confirmação enviado com sucesso!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao registrar usuário!");
        }
    }

    @GetMapping("/confirmar")
    public ResponseEntity<?> confirmEmail(@RequestParam String token) {
        try {
            authService.confirmEmail(token);
            return ResponseEntity.ok("E-mail confirmado com sucesso!");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{email}")
    public ResponseEntity<String> deleteUserByEmail(@PathVariable String email) {
        try {
            authService.deleteUserByEmail(email);
            return ResponseEntity.ok("Usuário com e-mail \"" + email + "\" excluído com sucesso!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
