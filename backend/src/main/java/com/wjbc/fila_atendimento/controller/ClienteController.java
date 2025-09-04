package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClienteResponseDTO>>> listarTodos() {
        List<ClienteResponseDTO> clientes = clienteService.listarTodos();
        return ResponseEntity.ok(new ApiResponse<>(true, "Clientes listados com sucesso", clientes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> buscarPorId(@PathVariable UUID id) {
        ClienteResponseDTO cliente = clienteService.buscarPorId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente encontrado", cliente));
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> buscarPorCpf(@PathVariable String cpf) {
        ClienteResponseDTO cliente = clienteService.buscarPorCpf(cpf);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente encontrado por CPF", cliente));
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<ApiResponse<List<ClienteResponseDTO>>> buscarPorNomeSemelhante(@PathVariable String nome) {
        List<ClienteResponseDTO> clientes = clienteService.buscarPorNomeSemelhante(nome);
        return ResponseEntity.ok(new ApiResponse<>(true, "Clientes encontrados por nome", clientes));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> criar(@RequestBody ClienteCreateDTO dto) {
        ClienteResponseDTO cliente = clienteService.criar(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente criado com sucesso", cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> substituir(@PathVariable UUID id, @RequestBody ClienteCreateDTO dto) {
        ClienteResponseDTO cliente = clienteService.substituir(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente atualizado com sucesso", cliente));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> atualizarParcialmente(@PathVariable UUID id, @RequestBody ClienteUpdateDTO dto) {
        ClienteResponseDTO cliente = clienteService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente atualizado parcialmente com sucesso", cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desativar(@PathVariable UUID id) {
        clienteService.desativar(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente desativado com sucesso", null));
    }
}
