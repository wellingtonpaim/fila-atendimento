package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "cpf", unique = true)
    private String cpf;

    @Column(name = "nome")
    private String nome;

    @Column(unique = true)
    private String email;

    @ElementCollection
    private List<Telefone> telefones;

    @Embedded
    private Endereco endereco;
}
