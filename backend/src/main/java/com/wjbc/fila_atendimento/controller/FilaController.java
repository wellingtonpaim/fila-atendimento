package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<FilaResponseDTO>>> listarPorUnidade(@PathVariable UUID unidadeId) {
        List<FilaResponseDTO> filas = filaService.listarPorUnidade(unidadeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Filas listadas por unidade", filas));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FilaResponseDTO>> buscarPorId(@PathVariable UUID id) {
        FilaResponseDTO fila = filaService.buscarPorId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Fila encontrada", fila));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FilaResponseDTO>> criar(@RequestBody FilaCreateDTO dto) {
        FilaResponseDTO fila = filaService.criar(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Fila criada com sucesso", fila));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<FilaResponseDTO>> atualizarParcialmente(@PathVariable UUID id, @RequestBody FilaUpdateDTO dto) {
        FilaResponseDTO fila = filaService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Fila atualizada com sucesso", fila));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desativar(@PathVariable UUID id) {
        filaService.desativar(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Fila desativada com sucesso", null));
    }
}
