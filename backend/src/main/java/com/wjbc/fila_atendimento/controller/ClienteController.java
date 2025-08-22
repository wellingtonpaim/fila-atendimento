package com.wjbc.fila_atendimento.controller;

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
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<ClienteResponseDTO> buscarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(clienteService.buscarPorCpf(cpf));
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<ClienteResponseDTO>> buscarPorNomeSemelhante(@PathVariable String nome) {
        return ResponseEntity.ok(clienteService.buscarPorNomeSemelhante(nome));
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> criar(@RequestBody ClienteCreateDTO dto) {
        return ResponseEntity.ok(clienteService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> substituir(@PathVariable UUID id, @RequestBody ClienteCreateDTO dto) {
        return ResponseEntity.ok(clienteService.substituir(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> atualizarParcialmente(@PathVariable UUID id, @RequestBody ClienteUpdateDTO dto) {
        return ResponseEntity.ok(clienteService.atualizarParcialmente(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        clienteService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
