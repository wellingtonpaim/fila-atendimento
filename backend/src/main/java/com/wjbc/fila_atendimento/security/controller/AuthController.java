package com.wjbc.fila_atendimento.security.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<String>> login(
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Usuário não encontrado", null));
            }
            boolean temAcesso = usuario.getUnidades() != null && usuario.getUnidades().stream()
                    .anyMatch(u -> u.getId().equals(unidadeAtendimentoId));

            if (!temAcesso) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(false, "Usuário não tem acesso a esta unidade", null));
            }

            String token = jwtTokenService.generateToken(username, unidadeAtendimentoId);
            ResponseEntity<ApiResponse<String>> teste = ResponseEntity.ok(new ApiResponse<>(true, "Login realizado com sucesso", token));
            return teste;
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Credenciais inválidas, verifique e tente novamente.", null));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody UsuarioCreateDTO dto) {
        try {
            authService.register(dto);
            return ResponseEntity.ok(new ApiResponse<>(true, "E-mail de confirmação enviado com sucesso!", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, "Erro ao registrar usuário!", null));
        }
    }

    @GetMapping("/confirmar")
    public ResponseEntity<ApiResponse<Void>> confirmEmail(@RequestParam String token) {
        try {
            authService.confirmEmail(token);
            return ResponseEntity.ok(new ApiResponse<>(true, "E-mail confirmado com sucesso!", null));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/delete/{email}")
    public ResponseEntity<ApiResponse<Void>> deleteUserByEmail(@PathVariable String email) {
        try {
            authService.deleteUserByEmail(email);
            return ResponseEntity.ok(new ApiResponse<>(true, "Usuário com e-mail '" + email + "' excluído com sucesso!", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

}
