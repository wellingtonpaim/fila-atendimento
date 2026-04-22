package com.wjbc.fila_atendimento.domain.dto;

/**
 * DTO retornado ao frontend com os dados de endereço obtidos via ViaCEP.
 * O campo "localidade" da ViaCEP é mapeado para "cidade".
 */
public record CepResponseDTO(
        String cep,
        String logradouro,
        String complemento,
        String bairro,
        String cidade,
        String uf
) {}
