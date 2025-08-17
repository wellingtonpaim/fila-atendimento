package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.model.Setor;
import com.wjbc.fila_atendimento.domain.repository.SetorRepository;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SetorServiceImpl implements SetorService {

    private final SetorRepository setorRepository;

    @Override
    @Transactional
    public Setor salvar(Setor setor) {
        // Exemplo de uma regra de negócio simples: não permitir nomes duplicados.
        // (Isso poderia ser feito com uma @Column(unique=true) no model, mas aqui demonstramos a validação no serviço)
        setorRepository.findByName(setor.getNome()).ifPresent(s -> {
            if (!s.getId().equals(setor.getId())) {
                throw new BusinessException("Já existe um setor cadastrado com o nome: " + setor.getNome());
            }
        });

        return setorRepository.save(setor);
    }

    @Override
    @Transactional(readOnly = true)
    public Setor buscarPorId(UUID setorId) {
        return setorRepository.findById(setorId)
                .orElseThrow(() -> new ResourceNotFoundException("Setor não encontrado com o ID: " + setorId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Setor> listarTodos() {
        return setorRepository.findAll();
    }

    @Override
    @Transactional
    public void deletar(UUID setorId) {
        Setor setor = buscarPorId(setorId);
        // Futuramente, poderíamos adicionar uma validação aqui:
        // Ex: Não permitir deletar um setor se ele tiver filas associadas.
        // if (filaRepository.existsBySetor(setor)) {
        //     throw new BusinessException("Não é possível deletar um setor que possui filas.");
        // }
        setorRepository.delete(setor);
    }
}
