package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.FilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaResponseDTO;
import com.wjbc.fila_atendimento.domain.service.FilaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/filas")
public class FilaController {
    private final FilaService filaService;

    public FilaController(FilaService filaService) {
        this.filaService = filaService;
    }

    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<List<FilaResponseDTO>> listarPorUnidade(@PathVariable UUID unidadeId) {
        return ResponseEntity.ok(filaService.listarPorUnidade(unidadeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FilaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(filaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<FilaResponseDTO> criar(@RequestBody FilaCreateDTO dto) {
        return ResponseEntity.ok(filaService.criar(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FilaResponseDTO> atualizarParcialmente(@PathVariable UUID id, @RequestBody FilaUpdateDTO dto) {
        return ResponseEntity.ok(filaService.atualizarParcialmente(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        filaService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
