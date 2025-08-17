package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UnidadeAtendimentoUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import org.springframework.stereotype.Component;

@Component
public class UnidadeAtendimentoMapper {

    public UnidadeAtendimento toEntity(UnidadeAtendimentoCreateDTO dto) {
        UnidadeAtendimento unidade = new UnidadeAtendimento();
        unidade.setNome(dto.nome());
        unidade.setEndereco(dto.endereco());
        unidade.setTelefones(dto.telefones());
        return unidade;
    }

    public UnidadeAtendimentoResponseDTO toResponseDTO(UnidadeAtendimento unidade) {
        return new UnidadeAtendimentoResponseDTO(
                unidade.getId(),
                unidade.getNome(),
                unidade.getEndereco(),
                unidade.getTelefones()
        );
    }

    public void applyPatchToEntity(UnidadeAtendimentoUpdateDTO dto, UnidadeAtendimento unidade) {
        if (dto.nome() != null) {
            unidade.setNome(dto.nome());
        }
        if (dto.endereco() != null) {
            unidade.setEndereco(dto.endereco());
        }
        if (dto.telefones() != null) {
            unidade.setTelefones(dto.telefones());
        }
    }
}