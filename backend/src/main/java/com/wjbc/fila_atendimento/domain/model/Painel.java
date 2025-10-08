package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "painel", schema = "fila_atendimento")
public class Painel {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_atendimento_id", nullable = false)
    private UnidadeAtendimento unidadeAtendimento;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "painel_fila",
            schema = "fila_atendimento",
            joinColumns = @JoinColumn(name = "painel_id"),
            inverseJoinColumns = @JoinColumn(name = "fila_id")
    )
    private List<Fila> filas;
}
