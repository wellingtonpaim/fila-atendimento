package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoResponseDTO;
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/unidades-atendimento")
public class UnidadeAtendimentoController {
    private final UnidadeAtendimentoService unidadeAtendimentoService;

    public UnidadeAtendimentoController(UnidadeAtendimentoService unidadeAtendimentoService) {
        this.unidadeAtendimentoService = unidadeAtendimentoService;
    }

    @GetMapping
    public ResponseEntity<List<UnidadeAtendimentoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(unidadeAtendimentoService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnidadeAtendimentoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(unidadeAtendimentoService.buscarPorId(id));
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<UnidadeAtendimentoResponseDTO>> buscarPorNomeContendo(@PathVariable String nome) {
        return ResponseEntity.ok(unidadeAtendimentoService.buscarPorNomeContendo(nome));
    }

    @PostMapping
    public ResponseEntity<UnidadeAtendimentoResponseDTO> criar(@RequestBody UnidadeAtendimentoCreateDTO dto) {
        return ResponseEntity.ok(unidadeAtendimentoService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnidadeAtendimentoResponseDTO> substituir(@PathVariable UUID id, @RequestBody UnidadeAtendimentoCreateDTO dto) {
        return ResponseEntity.ok(unidadeAtendimentoService.substituir(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UnidadeAtendimentoResponseDTO> atualizarParcialmente(@PathVariable UUID id, @RequestBody UnidadeAtendimentoUpdateDTO dto) {
        return ResponseEntity.ok(unidadeAtendimentoService.atualizarParcialmente(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        unidadeAtendimentoService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
