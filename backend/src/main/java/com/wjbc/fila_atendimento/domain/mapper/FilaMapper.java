package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.FilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.FilaUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.repository.SetorRepository;
import com.wjbc.fila_atendimento.domain.repository.UnidadeAtendimentoRepository;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FilaMapper {

    private final SetorMapper setorMapper;
    private final UnidadeAtendimentoMapper unidadeAtendimentoMapper;
    private final SetorRepository setorRepository;
    private final UnidadeAtendimentoRepository unidadeAtendimentoRepository;

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

        if (dto.setorId() != null) {
            Setor setor = setorRepository.findById(dto.setorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Setor não encontrado com o ID: " + dto.setorId()));
            fila.setSetor(setor);
        }

        if (dto.unidadeAtendimentoId() != null) {
            UnidadeAtendimento unidade = unidadeAtendimentoRepository.findById(dto.unidadeAtendimentoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unidade de Atendimento não encontrada com o ID: " + dto.unidadeAtendimentoId()));
            fila.setUnidadeAtendimento(unidade);
        }
    }
}
