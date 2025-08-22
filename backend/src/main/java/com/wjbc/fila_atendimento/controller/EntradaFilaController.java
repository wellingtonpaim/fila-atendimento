package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCreateDTO;
import com.wjbc.fila_atendimento.domain.service.EntradaFilaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/entrada-fila")
public class EntradaFilaController {
    private final EntradaFilaService entradaFilaService;

    public EntradaFilaController(EntradaFilaService entradaFilaService) {
        this.entradaFilaService = entradaFilaService;
    }

    @PostMapping
    public ResponseEntity<EntradaFilaResponseDTO> adicionarClienteAFila(@RequestBody EntradaFilaCreateDTO dto) {
        return ResponseEntity.ok(entradaFilaService.adicionarClienteAFila(dto));
    }

    @PostMapping("/chamar-proximo")
    public ResponseEntity<EntradaFilaResponseDTO> chamarProximo(@RequestParam UUID filaId, @RequestParam UUID usuarioId, @RequestParam String guiche) {
        return ResponseEntity.ok(entradaFilaService.chamarProximo(filaId, usuarioId, guiche));
    }

    @PostMapping("/finalizar/{entradaFilaId}")
    public ResponseEntity<EntradaFilaResponseDTO> finalizarAtendimento(@PathVariable UUID entradaFilaId) {
        return ResponseEntity.ok(entradaFilaService.finalizarAtendimento(entradaFilaId));
    }

    @PostMapping("/cancelar/{entradaFilaId}")
    public ResponseEntity<EntradaFilaResponseDTO> cancelarAtendimento(@PathVariable UUID entradaFilaId) {
        return ResponseEntity.ok(entradaFilaService.cancelarAtendimento(entradaFilaId));
    }

    @PostMapping("/encaminhar/{entradaFilaIdOrigem}")
    public ResponseEntity<EntradaFilaResponseDTO> encaminharParaFila(@PathVariable UUID entradaFilaIdOrigem, @RequestBody EntradaFilaCreateDTO dtoDestino) {
        return ResponseEntity.ok(entradaFilaService.encaminharParaFila(entradaFilaIdOrigem, dtoDestino));
    }

    @GetMapping("/aguardando/{filaId}")
    public ResponseEntity<List<EntradaFilaResponseDTO>> listarAguardandoPorFila(@PathVariable UUID filaId) {
        return ResponseEntity.ok(entradaFilaService.listarAguardandoPorFila(filaId));
    }
}
