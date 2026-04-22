package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.CepResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.ViaCepApiDTO;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.service.ViaCepService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class ViaCepServiceImpl implements ViaCepService {

    private static final String VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/";

    private final RestClient restClient = RestClient.create();

    @Override
    public CepResponseDTO buscarPorCep(String cep) {
        String cepLimpo = cep.replaceAll("[^0-9]", "");

        if (cepLimpo.length() != 8) {
            throw new IllegalArgumentException("CEP inválido: deve conter exatamente 8 dígitos.");
        }

        ViaCepApiDTO resposta;
        try {
            resposta = restClient.get()
                    .uri(VIACEP_URL, cepLimpo)
                    .retrieve()
                    .body(ViaCepApiDTO.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.");
        }

        if (resposta == null || Boolean.TRUE.equals(resposta.erro())) {
            throw new ResourceNotFoundException("CEP " + cep + " não encontrado.");
        }

        return new CepResponseDTO(
                resposta.cep(),
                resposta.logradouro(),
                resposta.complemento(),
                resposta.bairro(),
                resposta.localidade(),
                resposta.uf()
        );
    }
}
