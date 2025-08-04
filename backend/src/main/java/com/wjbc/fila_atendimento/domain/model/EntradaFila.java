package com.wjbc.fila_atendimento.domain.model;

import com.wjbc.fila_atendimento.enumeration.StatusFila;
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

    @Column(name = "codigo_paciente", nullable = false)
    private String codigoPaciente; // ex: CL5161

    @Column(name = "nome_paciente")
    private String nomePaciente; // Pode ser nulo para chamada anônima

    @Column(name = "prioridade")
    private Boolean prioridade;

    @Enumerated(EnumType.STRING)
    private StatusFila status;

    @Column(name = "data_hora_entrada", nullable = false)
    private LocalDateTime dataHoraEntrada;

    @Column(name = "data_hora_chamada")
    private LocalDateTime dataHoraChamada;
}