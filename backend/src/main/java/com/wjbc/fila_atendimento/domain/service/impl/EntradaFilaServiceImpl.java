package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.ChamadaDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.EntradaFilaResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelPublicoDTO;
import com.wjbc.fila_atendimento.domain.dto.PainelProfissionalDTO;
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
import com.wjbc.fila_atendimento.service.FilaBroadcastService;
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
    private final FilaBroadcastService filaBroadcastService;

    private ChamadaDTO getChamadaAtual(Fila fila) {
        return entradaFilaRepository.findFirstByFilaAndStatusOrderByDataHoraChamadaDesc(fila, StatusFila.CHAMADO)
            .map(e -> new ChamadaDTO(e.getCliente().getNome(), e.getGuicheOuSalaAtendimento(), e.getDataHoraChamada()))
            .orElse(null);
    }

    private List<ChamadaDTO> getUltimasChamadas(Fila fila) {
        return entradaFilaRepository.findTop3ByFilaAndStatusOrderByDataHoraChamadaDesc(fila, StatusFila.CHAMADO)
            .stream()
            .map(e -> new ChamadaDTO(e.getCliente().getNome(), e.getGuicheOuSalaAtendimento(), e.getDataHoraChamada()))
            .collect(Collectors.toList());
    }

    private List<EntradaFilaResponseDTO> getFilaAtual(UUID setorId) {
        List<Fila> filas = filaService.findBySetorId(setorId);
        return filas.stream()
            .flatMap(fila -> entradaFilaRepository.findByFilaAndStatusOrderByPrioridadeDescDataHoraEntradaAsc(fila, StatusFila.AGUARDANDO).stream())
            .map(entradaFilaMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO adicionarClienteAFila(EntradaFilaCreateDTO dto) {
        Cliente cliente = clienteService.findClienteById(dto.clienteId());
        Fila fila = filaService.findFilaById(dto.filaId());
        if (cliente == null) {
            throw new ResourceNotFoundException("Cliente não encontrado.");
        }
        if (fila == null) {
            throw new ResourceNotFoundException("Fila não encontrada.");
        }
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
        PainelPublicoDTO painelPublicoDTO = new PainelPublicoDTO(
            fila.getId(),
            getChamadaAtual(fila),
            getUltimasChamadas(fila),
            "", // mensagemVocalizacao
            15, // tempoExibicao
            3, // repeticoes
            5, // intervaloRepeticao
            true // sinalizacaoSonora
        );
        PainelProfissionalDTO painelProfissionalDTO = new PainelProfissionalDTO(
            fila.getSetor().getId(),
            getFilaAtual(fila.getSetor().getId())
        );
        filaBroadcastService.broadcastPainelUpdate(fila.getId(), painelPublicoDTO);
        filaBroadcastService.broadcastFilaUpdate(fila.getSetor().getId(), painelProfissionalDTO);
        return entradaFilaMapper.toResponseDTO(findEntradaFilaById(entradaSalva.getId()));
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO chamarProximo(UUID filaId, UUID usuarioId, String guiche) {
        Fila fila = filaService.findFilaById(filaId);
        Usuario usuario = usuarioService.findUsuarioById(usuarioId);

        Optional<EntradaFila> proximo;
        if ("Atendimento Médico".equalsIgnoreCase(fila.getNome())) {
            proximo = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                    fila, StatusFila.AGUARDANDO, true);
            if (proximo.isEmpty()) {
                proximo = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                        fila, StatusFila.AGUARDANDO, false);
            }
        } else {
            proximo = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                    fila, StatusFila.AGUARDANDO, false);
        }

        EntradaFila entradaASerChamada = proximo.orElseThrow(() -> new ResourceNotFoundException("Nenhum cliente aguardando nesta fila."));

        entradaASerChamada.setStatus(StatusFila.CHAMADO);
        entradaASerChamada.setDataHoraChamada(LocalDateTime.now());
        entradaASerChamada.setUsuarioResponsavel(usuario);
        entradaASerChamada.setGuicheOuSalaAtendimento(guiche);

        EntradaFilaResponseDTO response = entradaFilaMapper.toResponseDTO(entradaFilaRepository.save(entradaASerChamada));
        ChamadaDTO chamadaAtual = getChamadaAtual(fila);
        List<ChamadaDTO> ultimasChamadas = getUltimasChamadas(fila);
        String mensagemVocalizacao = chamadaAtual != null && chamadaAtual.getNomePaciente() != null && chamadaAtual.getGuicheOuSala() != null
            ? chamadaAtual.getNomePaciente() + ", compareça a " + chamadaAtual.getGuicheOuSala() + "!"
            : "";
        PainelPublicoDTO painelPublicoDTO = new PainelPublicoDTO(
            fila.getId(),
            chamadaAtual,
            ultimasChamadas,
            mensagemVocalizacao,
            15,
            3,
            5,
            true
        );
        PainelProfissionalDTO painelProfissionalDTO = new PainelProfissionalDTO(
            fila.getSetor().getId(),
            getFilaAtual(fila.getSetor().getId())
        );
        filaBroadcastService.broadcastPainelUpdate(fila.getId(), painelPublicoDTO);
        filaBroadcastService.broadcastFilaUpdate(fila.getSetor().getId(), painelProfissionalDTO);
        return response;
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

        EntradaFilaResponseDTO response = entradaFilaMapper.toResponseDTO(entradaFilaRepository.save(entrada));
        PainelPublicoDTO painelPublicoDTO = new PainelPublicoDTO(
            entrada.getFila().getId(),
            getChamadaAtual(entrada.getFila()),
            getUltimasChamadas(entrada.getFila()),
            "",
            15,
            3,
            5,
            true
        );
        PainelProfissionalDTO painelProfissionalDTO = new PainelProfissionalDTO(
            entrada.getFila().getSetor().getId(),
            getFilaAtual(entrada.getFila().getSetor().getId())
        );
        filaBroadcastService.broadcastPainelUpdate(entrada.getFila().getId(), painelPublicoDTO);
        filaBroadcastService.broadcastFilaUpdate(entrada.getFila().getSetor().getId(), painelProfissionalDTO);
        return response;
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
        EntradaFilaResponseDTO response = adicionarClienteAFila(dtoDestino);
        Fila filaDestino = filaService.findFilaById(dtoDestino.filaId());
        PainelPublicoDTO painelPublicoDTO = new PainelPublicoDTO(
            filaDestino.getId(),
            getChamadaAtual(filaDestino),
            getUltimasChamadas(filaDestino),
            "",
            15,
            3,
            5,
            true
        );
        PainelProfissionalDTO painelProfissionalDTO = new PainelProfissionalDTO(
            filaDestino.getSetor().getId(),
            getFilaAtual(filaDestino.getSetor().getId())
        );
        filaBroadcastService.broadcastPainelUpdate(filaDestino.getId(), painelPublicoDTO);
        filaBroadcastService.broadcastFilaUpdate(filaDestino.getSetor().getId(), painelProfissionalDTO);
        return response;
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
