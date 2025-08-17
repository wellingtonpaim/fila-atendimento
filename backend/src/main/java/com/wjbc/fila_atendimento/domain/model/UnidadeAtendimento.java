// Pacote: com.wjbc.fila_atendimento.domain.model
package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "unidade_atendimento")
@SQLDelete(sql = "UPDATE unidade_atendimento SET ativo = false WHERE id = ?")
@Where(clause = "ativo = true")
public class UnidadeAtendimento {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false) // Nome da coluna padronizado para 'id'
    private UUID id;

    @Column(name = "nome", nullable = false, unique = true)
    private String nome;

    @Embedded
    private Endereco endereco;

    @ElementCollection
    private List<Telefone> telefones;

    @Column(nullable = false)
    private boolean ativo = true;

}