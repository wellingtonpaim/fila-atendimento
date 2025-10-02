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
import com.wjbc.fila_atendimento.domain.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${painel.publico.tempo-exibicao-segundos:15}")
    private int painelTempoExibicaoSegundos;

    @Value("${painel.publico.repeticoes:3}")
    private int painelRepeticoes;

    @Value("${painel.publico.intervalo-repeticao-segundos:5}")
    private int painelIntervaloSegundos;

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

        // Notifica painéis sobre a atualização na fila (sem vocalização)
        notificarPaineis(fila, false);

        return entradaFilaMapper.toResponseDTO(findEntradaFilaById(entradaSalva.getId()));
    }

    @Override
    @Transactional
    public EntradaFilaResponseDTO chamarProximo(UUID filaId, UUID usuarioId, String guiche) {
        Fila fila = filaService.findFilaById(filaId);
        Usuario usuario = usuarioService.findUsuarioById(usuarioId);

        Optional<EntradaFila> proximo = encontrarProximoCliente(fila);

        EntradaFila entradaASerChamada = proximo.orElseThrow(() -> new ResourceNotFoundException("Nenhum cliente aguardando nesta fila."));

        entradaASerChamada.setStatus(StatusFila.CHAMADO);
        entradaASerChamada.setDataHoraChamada(LocalDateTime.now());
        entradaASerChamada.setUsuarioResponsavel(usuario);
        entradaASerChamada.setGuicheOuSalaAtendimento(guiche);

        EntradaFila entradaSalva = entradaFilaRepository.save(entradaASerChamada);

        // Notifica painéis sobre a nova chamada (com vocalização)
        notificarPaineis(fila, true);

        return entradaFilaMapper.toResponseDTO(entradaSalva);
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

        EntradaFila entradaSalva = entradaFilaRepository.save(entrada);

        // Notifica painéis que a chamada atual foi finalizada (sem vocalização)
        notificarPaineis(entrada.getFila(), false);

        return entradaFilaMapper.toResponseDTO(entradaSalva);
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
        // Primeiro, finaliza o atendimento atual
        finalizarAtendimento(entradaFilaIdOrigem);

        // Em seguida, adiciona o cliente à nova fila
        EntradaFilaResponseDTO novaEntrada = adicionarClienteAFila(dtoDestino);

        // A notificação para a fila de destino já é feita dentro de adicionarClienteAFila.
        // A notificação para a fila de origem já é feita dentro de finalizarAtendimento.
        // Nenhuma notificação adicional é necessária aqui.

        return novaEntrada;
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

    // ===================================================================
    // MÉTODOS PRIVADOS AUXILIARES
    // ===================================================================

    private EntradaFila findEntradaFilaById(UUID id) {
        return entradaFilaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada na fila não encontrada com o ID: " + id));
    }

    private Optional<EntradaFila> encontrarProximoCliente(Fila fila) {
        if ("Atendimento Médico".equalsIgnoreCase(fila.getNome())) {
            Optional<EntradaFila> retorno = entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                    fila, StatusFila.AGUARDANDO, true);
            if (retorno.isPresent()) {
                return retorno;
            }
        }
        return entradaFilaRepository.findFirstByFilaAndStatusAndIsRetornoOrderByPrioridadeDescDataHoraEntradaAsc(
                fila, StatusFila.AGUARDANDO, false);
    }

    private void notificarPaineis(Fila fila, boolean isNovaChamada) {
        ChamadaDTO chamadaAtual = getChamadaAtual(fila);
        List<ChamadaDTO> ultimasChamadas = getUltimasChamadas(fila);

        String mensagemVocalizacao = "";
        if (isNovaChamada && chamadaAtual != null && chamadaAtual.nomePaciente() != null && !chamadaAtual.nomePaciente().isBlank()
                && chamadaAtual.guicheOuSala() != null && !chamadaAtual.guicheOuSala().isBlank()) {
            mensagemVocalizacao = chamadaAtual.nomePaciente() + ", compareça a " + chamadaAtual.guicheOuSala() + "!";
        }
        boolean habilitarSom = !mensagemVocalizacao.isBlank();

        PainelPublicoDTO painelPublicoPayload = new PainelPublicoDTO(
                fila.getId(),
                chamadaAtual,
                ultimasChamadas,
                mensagemVocalizacao,
                painelTempoExibicaoSegundos,
                painelRepeticoes,
                painelIntervaloSegundos,
                habilitarSom
        );

        PainelProfissionalDTO painelProfissionalPayload = new PainelProfissionalDTO(
                fila.getSetor().getId(),
                getFilaAtual(fila.getSetor().getId())
        );

        filaBroadcastService.broadcastPainelUpdate(fila.getId(), painelPublicoPayload);
        filaBroadcastService.broadcastFilaUpdate(fila.getSetor().getId(), painelProfissionalPayload);
    }
}
