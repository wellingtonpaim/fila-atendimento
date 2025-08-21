package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.EntradaFilaMapper;
import com.wjbc.fila_atendimento.domain.model.Cliente;
import com.wjbc.fila_atendimento.domain.model.EntradaFila;
import com.wjbc.fila_atendimento.domain.model.Fila;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.repository.EntradaFilaRepository;
import com.wjbc.fila_atendimento.domain.service.ClienteService;
import com.wjbc.fila_atendimento.domain.service.EntradaFilaService;
import com.wjbc.fila_atendimento.domain.service.FilaService;
import com.wjbc.fila_atendimento.domain.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntradaFilaServiceImpl implements EntradaFilaService {

    private final EntradaFilaRepository entradaFilaRepository;
    private final EntradaFilaMapper entradaFilaMapper;
    private final ClienteService clienteService;
    private final FilaService filaService;
    private final UsuarioService usuarioService;

    @Override
    @Transactional
    public EntradaFilaResponseDTO adicionarClienteAFila(EntradaFilaCreateDTO dto) {
        Cliente cliente = clienteService.findClienteById(dto.clienteId());
        Fila fila = filaService.findFilaById(dto.filaId());

        if (entradaFilaRepository.existsByClienteAndFilaAndStatus(cliente, fila, StatusFila.AGUARDANDO)) {
            throw new BusinessException("Este cliente já está aguardando nesta fila.");
        }

        EntradaFila novaEntrada = new EntradaFila();
        novaEntrada.setCliente(cliente);
        novaEntrada.setFila(fila);
        novaEntrada.setPrioridade(dto.prioridade());
        novaEntrada.setRetorno(dto.isRetorno() != null && dto.isRetorno());
        novaEntrada.setStatus(StatusFila.AGUARDANDO);
        novaEntrada.setDataHoraEntrada(LocalDateTime.now());

        EntradaFila entradaSalva = entradaFilaRepository.save(novaEntrada);
        return entradaFilaMapper.toResponseDTO(findEntradaFilaById(entradaSalva.getId()));
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO chamarProximo(UUID filaId, UUID usuarioId, String guiche) {
        Fila fila = filaService.findFilaById(filaId);
        Usuario usuario = usuarioService.findUsuarioById(usuarioId);

        Optional<EntradaFila> proximo;

        // Implementa a lógica de negócio específica para a fila de "Atendimento Médico"
        if ("Atendimento Médico".equalsIgnoreCase(fila.getNome())) {
            // 1. Tenta buscar um retorno prioritariamente.
            proximo = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                    fila, StatusFila.AGUARDANDO, true);

            // 2. Se não houver retornos, busca um atendimento normal.
            if (proximo.isEmpty()) {
                proximo = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                        fila, StatusFila.AGUARDANDO, false);
            }
        } else {
            // Para todas as outras filas, busca o próximo normalmente (sem ser retorno).
            proximo = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                    fila, StatusFila.AGUARDANDO, false);
        }

        EntradaFila entradaASerChamada = proximo.orElseThrow(() -> new ResourceNotFoundException("Nenhum cliente aguardando nesta fila."));

        entradaASerChamada.setStatus(StatusFila.CHAMADO);
        entradaASerChamada.setDataHoraChamada(LocalDateTime.now());
        entradaASerChamada.setUsuarioResponsavel(usuario);
        entradaASerChamada.setGuicheOuSalaAtendimento(guiche);

        return entradaFilaMapper.toResponseDTO(entradaFilaRepository.save(entradaASerChamada));
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO finalizarAtendimento(UUID entradaFilaId) {
        EntradaFila entrada = findEntradaFilaById(entradaFilaId);
        if (entrada.getStatus() != StatusFila.CHAMADO) {
            throw new BusinessException("Só é possível finalizar um atendimento com status 'CHAMADO'.");
        }
        entrada.setStatus(StatusFila.ATENDIDO);
        entrada.setDataHoraSaida(LocalDateTime.now());
        return entradaFilaMapper.toResponseDTO(entradaFilaRepository.save(entrada));
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO cancelarAtendimento(UUID entradaFilaId) {
        EntradaFila entrada = findEntradaFilaById(entradaFilaId);
        if (entrada.getStatus() == StatusFila.ATENDIDO) {
            throw new BusinessException("Não é possível cancelar um atendimento que já foi finalizado.");
        }
        // O @SQLDelete no model fará a mágica de mudar o status e a data_hora_saida.
        entradaFilaRepository.delete(entrada);
        // Recarregamos a entidade do banco para retornar o estado atualizado pelo trigger do @SQLDelete.
        EntradaFila entradaCancelada = entradaFilaRepository.findById(entradaFilaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada na fila não encontrada com o ID: " + entradaFilaId));

        return entradaFilaMapper.toResponseDTO(entradaCancelada);
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO encaminharParaFila(UUID entradaFilaIdOrigem, EntradaFilaCreateDTO dtoDestino) {
        finalizarAtendimento(entradaFilaIdOrigem);
        return adicionarClienteAFila(dtoDestino);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntradaFilaResponseDTO> listarAguardandoPorFila(UUID filaId) {
        Fila fila = filaService.findFilaById(filaId);
        return entradaFilaRepository.findByFilaAndStatusOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO)
                .stream()
                .map(entradaFilaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    private EntradaFila findEntradaFilaById(UUID id) {
        return entradaFilaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada na fila não encontrada com o ID: " + id));
    }
}