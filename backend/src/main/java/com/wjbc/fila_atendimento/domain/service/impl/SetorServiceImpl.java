package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.SetorMapper;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.repository.FilaRepository;
import com.wjbc.fila_atendimento.domain.repository.SetorRepository;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SetorServiceImpl implements SetorService {

    private final SetorRepository setorRepository;
    private final FilaRepository filaRepository;
    private final SetorMapper setorMapper;

    @Override
    @Transactional
    public SetorResponseDTO criar(SetorCreateDTO setorDTO) {
        validarNome(setorDTO.nome(), null);
        Setor setor = setorMapper.toEntity(setorDTO);
        setor.setAtivo(true);
        return setorMapper.toResponseDTO(setorRepository.save(setor));
    }

    @Override
    @Transactional
    public SetorResponseDTO substituir(UUID id, SetorCreateDTO setorDTO) {
        Setor setorExistente = findSetorById(id);
        validarNome(setorDTO.nome(), id);
        setorExistente.setNome(setorDTO.nome());
        return setorMapper.toResponseDTO(setorRepository.save(setorExistente));
    }

    @Override
    @Transactional
    public SetorResponseDTO atualizarParcialmente(UUID id, SetorUpdateDTO setorDTO) {
        Setor setorExistente = findSetorById(id);
        setorMapper.applyPatchToEntity(setorDTO, setorExistente);
        validarNome(setorExistente.getNome(), id);
        return setorMapper.toResponseDTO(setorRepository.save(setorExistente));
    }

    @Override
    @Transactional(readOnly = true)
    public SetorResponseDTO buscarPorId(UUID id) {
        return setorMapper.toResponseDTO(findSetorById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SetorResponseDTO> listarTodos() {
        return setorRepository.findAll().stream()
                .map(setorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SetorResponseDTO> buscarPorNomeContendo(String nome) {
        return setorRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(setorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        Setor setor = findSetorById(id);
         if (filaRepository.existsBySetorAndAtivaIsTrue(setor)) {
            throw new BusinessException("Setor não pode ser desativado pois possui filas ativas.");
         }
        setorRepository.delete(setor);
    }

    @Override
    public Setor findSetorById(UUID id) {
        return setorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setor não encontrado com o ID: " + id));
    }

    private void validarNome(String nome, UUID idExcluido) {
        setorRepository.findByNome(nome).ifPresent(setor -> {
            if (idExcluido == null || !setor.getId().equals(idExcluido)) {
                throw new BusinessException("Já existe um setor cadastrado com o nome: " + nome);
            }
        });
    }
}