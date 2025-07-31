package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "unidade_atendimento")
public class UnidadeAtendimento {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "unidade_atendimento_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "nome")
    String nome;

    @Embedded
    Endereco endereco;

    @ElementCollection
    List<Telefone> telefones;
}
