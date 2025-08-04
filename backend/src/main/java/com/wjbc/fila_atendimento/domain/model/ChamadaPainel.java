package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "chamada_painel")
public class ChamadaPainel {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "fila_id", nullable = false)
    private Fila fila;

    @Column(name = "codigo_paciente", nullable = false)
    private String codigoPaciente;

    @Column(name = "guiche_ou_sala")
    private String guicheOuSala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setor_id", nullable = false)
    private Setor setor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeAtendimento unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "painel_id", nullable = false)
    private Painel painel;

    @Column(name = "data_hora_chamada", nullable = false)
    private LocalDateTime dataHoraChamada;
}
