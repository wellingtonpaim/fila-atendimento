package com.wjbc.fila_atendimento.domain.dto;

import java.util.List;
import java.util.UUID;

public class PainelPublicoDTO {
    private UUID filaId;
    private ChamadaDTO chamadaAtual;
    private List<ChamadaDTO> ultimasChamadas;
    private String mensagemVocalizacao;
    private int tempoExibicao;
    private int repeticoes;
    private int intervaloRepeticao;
    private boolean sinalizacaoSonora;

    public PainelPublicoDTO(UUID filaId, ChamadaDTO chamadaAtual, List<ChamadaDTO> ultimasChamadas,
                            String mensagemVocalizacao, int tempoExibicao, int repeticoes, int intervaloRepeticao, boolean sinalizacaoSonora) {
        this.filaId = filaId;
        this.chamadaAtual = chamadaAtual;
        this.ultimasChamadas = ultimasChamadas;
        this.mensagemVocalizacao = mensagemVocalizacao;
        this.tempoExibicao = tempoExibicao;
        this.repeticoes = repeticoes;
        this.intervaloRepeticao = intervaloRepeticao;
        this.sinalizacaoSonora = sinalizacaoSonora;
    }

    public UUID getFilaId() { return filaId; }
    public ChamadaDTO getChamadaAtual() { return chamadaAtual; }
    public List<ChamadaDTO> getUltimasChamadas() { return ultimasChamadas; }
    public String getMensagemVocalizacao() { return mensagemVocalizacao; }
    public int getTempoExibicao() { return tempoExibicao; }
    public int getRepeticoes() { return repeticoes; }
    public int getIntervaloRepeticao() { return intervaloRepeticao; }
    public boolean isSinalizacaoSonora() { return sinalizacaoSonora; }
}
