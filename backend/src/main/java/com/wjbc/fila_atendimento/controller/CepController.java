package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.CepResponseDTO;
import com.wjbc.fila_atendimento.domain.service.ViaCepService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cep")
public class CepController {

    private final ViaCepService viaCepService;

    public CepController(ViaCepService viaCepService) {
        this.viaCepService = viaCepService;
    }

    @GetMapping("/{cep}")
    public ResponseEntity<ApiResponse<CepResponseDTO>> buscarPorCep(@PathVariable String cep) {
        CepResponseDTO endereco = viaCepService.buscarPorCep(cep);
        return ResponseEntity.ok(new ApiResponse<>(true, "Endereço encontrado", endereco));
    }
}
