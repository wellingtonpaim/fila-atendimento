package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.util.UUID;

@Data
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "fila", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"nome", "unidade_atendimento_id"}, name = "uk_fila_nome_unidade")
})
@SQLDelete(sql = "UPDATE fila SET ativa = false WHERE id = ?")
@Where(clause = "ativa = true")
public class Fila {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false) // Nome da coluna padronizado
    private UUID id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "ativa", nullable = false)
    private boolean ativa = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setor_id", nullable = false)
    private Setor setor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_atendimento_id", nullable = false)
    private UnidadeAtendimento unidadeAtendimento;

}