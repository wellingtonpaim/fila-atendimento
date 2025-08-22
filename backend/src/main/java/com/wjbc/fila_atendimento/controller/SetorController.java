package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/setores")
public class SetorController {
    private final SetorService setorService;

    public SetorController(SetorService setorService) {
        this.setorService = setorService;
    }

    @GetMapping
    public ResponseEntity<List<SetorResponseDTO>> listarTodos() {
        return ResponseEntity.ok(setorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SetorResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(setorService.buscarPorId(id));
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<SetorResponseDTO>> buscarPorNomeContendo(@PathVariable String nome) {
        return ResponseEntity.ok(setorService.buscarPorNomeContendo(nome));
    }

    @PostMapping
    public ResponseEntity<SetorResponseDTO> criar(@RequestBody SetorCreateDTO dto) {
        return ResponseEntity.ok(setorService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SetorResponseDTO> substituir(@PathVariable UUID id, @RequestBody SetorCreateDTO dto) {
        return ResponseEntity.ok(setorService.substituir(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SetorResponseDTO> atualizarParcialmente(@PathVariable UUID id, @RequestBody SetorUpdateDTO dto) {
        return ResponseEntity.ok(setorService.atualizarParcialmente(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        setorService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
