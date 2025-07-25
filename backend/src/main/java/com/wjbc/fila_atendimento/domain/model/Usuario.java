package com.wjbc.fila_atendimento.domain.model;

import com.wjbc.fila_atendimento.enumeration.CategoriaUsuario;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id")
    private Long id;

    @Column(name = "nome_usuario")
    private String nomeUsuario;

    @Column(unique = true)
    private String email;

    private String senha;

    @Enumerated(EnumType.STRING)
    private CategoriaUsuario categoria;

    @Column(columnDefinition = "boolean default false")
    private boolean ativo;

}
