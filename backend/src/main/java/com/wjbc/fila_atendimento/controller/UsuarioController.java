package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioResponseDTO>>> listarTodos() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuários listados com sucesso", usuarios));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> buscarPorId(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário encontrado", usuario));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> buscarPorEmail(@PathVariable String email) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorEmail(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário encontrado por e-mail", usuario));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> criar(@RequestBody UsuarioCreateDTO dto) {
        UsuarioResponseDTO usuario = usuarioService.criar(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário criado com sucesso", usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> substituir(@PathVariable UUID id, @RequestBody UsuarioCreateDTO dto) {
        UsuarioResponseDTO usuario = usuarioService.substituir(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário atualizado com sucesso", usuario));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> atualizarParcialmente(@PathVariable UUID id, @RequestBody UsuarioUpdateDTO dto) {
        UsuarioResponseDTO usuario = usuarioService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário atualizado parcialmente com sucesso", usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desativar(@PathVariable UUID id) {
        usuarioService.desativar(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário desativado com sucesso", null));
    }

    @PatchMapping("/{id}/promover")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> promoverParaAdministrador(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.promoverParaAdministrador(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário promovido para administrador com sucesso", usuario));
    }
}
