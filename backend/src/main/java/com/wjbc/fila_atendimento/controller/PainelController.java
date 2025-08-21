package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.PainelCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelResponseDTO;
import com.wjbc.fila_atendimento.domain.service.PainelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/painel")
@RequiredArgsConstructor
@CrossOrigin
public class PainelController {

    private final PainelService painelService;

    @PostMapping
    public ResponseEntity<PainelResponseDTO> criar(@Valid @RequestBody PainelCreateDTO dto) {
        PainelResponseDTO response = painelService.criar(dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PainelResponseDTO> atualizar(@PathVariable UUID id, @Valid @RequestBody PainelUpdateDTO dto) {
        PainelResponseDTO response = painelService.atualizar(id, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PainelResponseDTO> buscarPorId(@PathVariable UUID id, @RequestParam UUID unidadeAtendimentoId) {
        PainelResponseDTO response = painelService.buscarPorId(id, unidadeAtendimentoId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PainelResponseDTO>> listarTodos(@RequestParam UUID unidadeAtendimentoId) {
        List<PainelResponseDTO> lista = painelService.listarTodos(unidadeAtendimentoId);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<List<PainelResponseDTO>> listarPorUnidade(@PathVariable UUID unidadeId) {
        List<PainelResponseDTO> lista = painelService.listarPorUnidade(unidadeId);
        return ResponseEntity.ok(lista);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        painelService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
