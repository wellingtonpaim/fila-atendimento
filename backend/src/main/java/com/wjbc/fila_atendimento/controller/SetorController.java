package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import com.wjbc.fila_atendimento.controller.util.PaginationUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/setores")
@Validated
public class SetorController {
    private final SetorService setorService;

    public SetorController(SetorService setorService) {
        this.setorService = setorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SetorResponseDTO>>> listarTodos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        List<SetorResponseDTO> setores = setorService.listarTodos();
        return PaginationUtil.build(setores, page, size, "Setores listados com sucesso");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SetorResponseDTO>> buscarPorId(@PathVariable UUID id) {
        SetorResponseDTO setor = setorService.buscarPorId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Setor encontrado", setor));
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<ApiResponse<List<SetorResponseDTO>>> buscarPorNomeContendo(
            @PathVariable String nome,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        List<SetorResponseDTO> setores = setorService.buscarPorNomeContendo(nome);
        return PaginationUtil.build(setores, page, size, "Setores encontrados por nome");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SetorResponseDTO>> criar(@Valid @RequestBody SetorCreateDTO dto) {
        SetorResponseDTO setor = setorService.criar(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Setor criado com sucesso", setor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SetorResponseDTO>> substituir(@PathVariable UUID id, @Valid @RequestBody SetorCreateDTO dto) {
        SetorResponseDTO setor = setorService.substituir(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Setor atualizado com sucesso", setor));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<SetorResponseDTO>> atualizarParcialmente(@PathVariable UUID id, @Valid @RequestBody SetorUpdateDTO dto) {
        SetorResponseDTO setor = setorService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Setor atualizado parcialmente com sucesso", setor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desativar(@PathVariable UUID id) {
        setorService.desativar(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Setor desativado com sucesso", null));
    }
}
