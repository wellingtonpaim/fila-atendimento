package com.wjbc.fila_atendimento.domain.model;

import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "entrada_fila")
public class EntradaFila {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "entrada_fila_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "fila_id", nullable = false)
    private Fila fila;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_cpf", nullable = false)
    private Cliente cliente;

    @Column(name = "prioridade")
    private Boolean prioridade;

    @Enumerated(EnumType.STRING)
    private StatusFila status;

    @Column(name = "data_hora_entrada", nullable = false)
    private LocalDateTime dataHoraEntrada;

    @Column(name = "data_hora_chamada")
    private LocalDateTime dataHoraChamada;

    @Column(name = "data_hora_saida")
    private LocalDateTime dataHoraSaida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsavel_id")
    private Usuario usuarioResponsavel;

    @Column(name = "guiche_ou_sala_atendimento")
    private String guicheOuSalaAtendimento;

    @Column(name = "retorno", columnDefinition = "boolean default false")
    private boolean isRetorno = false;

}