package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoPublicDTO;
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import com.wjbc.fila_atendimento.controller.util.PaginationUtil;
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
    public ResponseEntity<ApiResponse<List<UnidadeAtendimentoResponseDTO>>> listarTodas(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        List<UnidadeAtendimentoResponseDTO> unidades = unidadeAtendimentoService.listarTodas();
        return PaginationUtil.build(unidades, page, size, "Unidades de atendimento listadas com sucesso");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnidadeAtendimentoResponseDTO>> buscarPorId(@PathVariable UUID id) {
        UnidadeAtendimentoResponseDTO unidade = unidadeAtendimentoService.buscarPorId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unidade de atendimento encontrada", unidade));
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<ApiResponse<List<UnidadeAtendimentoResponseDTO>>> buscarPorNomeContendo(
            @PathVariable String nome,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        List<UnidadeAtendimentoResponseDTO> unidades = unidadeAtendimentoService.buscarPorNomeContendo(nome);
        return PaginationUtil.build(unidades, page, size, "Unidades encontradas por nome");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UnidadeAtendimentoResponseDTO>> criar(@RequestBody UnidadeAtendimentoCreateDTO dto) {
        UnidadeAtendimentoResponseDTO unidade = unidadeAtendimentoService.criar(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unidade de atendimento criada com sucesso", unidade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnidadeAtendimentoResponseDTO>> substituir(@PathVariable UUID id, @RequestBody UnidadeAtendimentoCreateDTO dto) {
        UnidadeAtendimentoResponseDTO unidade = unidadeAtendimentoService.substituir(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unidade de atendimento atualizada com sucesso", unidade));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UnidadeAtendimentoResponseDTO>> atualizarParcialmente(@PathVariable UUID id, @RequestBody UnidadeAtendimentoUpdateDTO dto) {
        UnidadeAtendimentoResponseDTO unidade = unidadeAtendimentoService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unidade de atendimento atualizada parcialmente com sucesso", unidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desativar(@PathVariable UUID id) {
        unidadeAtendimentoService.desativar(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unidade de atendimento desativada com sucesso", null));
    }

    @GetMapping("/public/login")
    public ResponseEntity<ApiResponse<List<UnidadeAtendimentoPublicDTO>>> listarUnidadesParaLogin(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        List<UnidadeAtendimentoPublicDTO> unidades = unidadeAtendimentoService.listarUnidadesParaLogin();
        return PaginationUtil.build(unidades, page, size, "Unidades disponíveis para login listadas com sucesso");
    }
}
