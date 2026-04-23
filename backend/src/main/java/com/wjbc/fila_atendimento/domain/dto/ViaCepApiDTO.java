package com.wjbc.fila_atendimento.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO interno para deserializar a resposta da API pública ViaCEP.
 * Não exposto diretamente ao frontend.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ViaCepApiDTO(
        String cep,
        String logradouro,
        String complemento,
        String bairro,
        String localidade,
        String uf,
        Boolean erro
) {}
