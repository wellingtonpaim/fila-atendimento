package com.wjbc.fila_atendimento.domain.model;

import com.wjbc.fila_atendimento.domain.enumeration.StatusFila;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "entrada_fila", schema = "fila_atendimento")
@SQLDelete(sql = "UPDATE fila_atendimento.entrada_fila SET status = 'CANCELADO', data_hora_saida = CURRENT_TIMESTAMP WHERE id = ?")
public class EntradaFila {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false) // Nome da coluna padronizado
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fila_id", nullable = false)
    private Fila fila;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false) // Corrigido de 'cliente_cpf' para 'cliente_id'
    private Cliente cliente;

    @Column(nullable = false)
    private Boolean prioridade = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusFila status;

    @Column(name = "retorno", nullable = false)
    private boolean isRetorno = false;

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
}