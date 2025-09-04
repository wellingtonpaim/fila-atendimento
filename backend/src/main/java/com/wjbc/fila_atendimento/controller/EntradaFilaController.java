package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<EntradaFilaResponseDTO>> adicionarClienteAFila(@RequestBody EntradaFilaCreateDTO dto) {
        EntradaFilaResponseDTO response = entradaFilaService.adicionarClienteAFila(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente adicionado à fila com sucesso", response));
    }

    @PostMapping("/chamar-proximo")
    public ResponseEntity<ApiResponse<EntradaFilaResponseDTO>> chamarProximo(@RequestParam UUID filaId, @RequestParam UUID usuarioId, @RequestParam String guiche) {
        EntradaFilaResponseDTO response = entradaFilaService.chamarProximo(filaId, usuarioId, guiche);
        return ResponseEntity.ok(new ApiResponse<>(true, "Próximo cliente chamado com sucesso", response));
    }

    @PostMapping("/finalizar/{entradaFilaId}")
    public ResponseEntity<ApiResponse<EntradaFilaResponseDTO>> finalizarAtendimento(@PathVariable UUID entradaFilaId) {
        EntradaFilaResponseDTO response = entradaFilaService.finalizarAtendimento(entradaFilaId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Atendimento finalizado com sucesso", response));
    }

    @PostMapping("/cancelar/{entradaFilaId}")
    public ResponseEntity<ApiResponse<EntradaFilaResponseDTO>> cancelarAtendimento(@PathVariable UUID entradaFilaId) {
        EntradaFilaResponseDTO response = entradaFilaService.cancelarAtendimento(entradaFilaId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Atendimento cancelado com sucesso", response));
    }

    @PostMapping("/encaminhar/{entradaFilaIdOrigem}")
    public ResponseEntity<ApiResponse<EntradaFilaResponseDTO>> encaminharParaFila(@PathVariable UUID entradaFilaIdOrigem, @RequestBody EntradaFilaCreateDTO dtoDestino) {
        EntradaFilaResponseDTO response = entradaFilaService.encaminharParaFila(entradaFilaIdOrigem, dtoDestino);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cliente encaminhado para outra fila com sucesso", response));
    }

    @GetMapping("/aguardando/{filaId}")
    public ResponseEntity<ApiResponse<List<EntradaFilaResponseDTO>>> listarAguardandoPorFila(@PathVariable UUID filaId) {
        List<EntradaFilaResponseDTO> lista = entradaFilaService.listarAguardandoPorFila(filaId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Clientes aguardando listados com sucesso", lista));
    }
}
