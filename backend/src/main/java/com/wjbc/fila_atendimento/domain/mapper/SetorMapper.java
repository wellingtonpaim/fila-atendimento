package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Setor;
import org.springframework.stereotype.Component;

@Component
public class SetorMapper {

    public Setor toEntity(SetorCreateDTO dto) {
        Setor setor = new Setor();
        setor.setNome(dto.nome());
        return setor;
    }

    public SetorResponseDTO toResponseDTO(Setor setor) {
        return new SetorResponseDTO(setor.getId(), setor.getNome());
    }

    public void applyPatchToEntity(SetorUpdateDTO dto, Setor setor) {
        if (dto.nome() != null) {
            setor.setNome(dto.nome());
        }
    }
}
