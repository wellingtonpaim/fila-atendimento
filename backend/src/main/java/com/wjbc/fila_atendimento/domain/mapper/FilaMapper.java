package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.FilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FilaMapper {

    private final SetorMapper setorMapper;
    private final UnidadeAtendimentoMapper unidadeAtendimentoMapper;

    public Fila toEntity(FilaCreateDTO dto, Setor setor, UnidadeAtendimento unidade) {
        Fila fila = new Fila();
        fila.setNome(dto.nome());
        fila.setSetor(setor);
        fila.setUnidadeAtendimento(unidade);
        return fila;
    }

    public FilaResponseDTO toResponseDTO(Fila fila) {
        return new FilaResponseDTO(
                fila.getId(),
                fila.getNome(),
                setorMapper.toResponseDTO(fila.getSetor()),
                unidadeAtendimentoMapper.toResponseDTO(fila.getUnidadeAtendimento())
        );
    }

    public void applyPatchToEntity(FilaUpdateDTO dto, Fila fila) {
        if (dto.nome() != null) {
            fila.setNome(dto.nome());
        }
    }
}
