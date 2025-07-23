package com.wjbc.fila_atendimento.domain.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @Column(name = "cpf")
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
