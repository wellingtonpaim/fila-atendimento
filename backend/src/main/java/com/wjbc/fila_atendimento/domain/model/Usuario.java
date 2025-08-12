package com.wjbc.fila_atendimento.domain.model;

import com.wjbc.fila_atendimento.enumeration.CategoriaUsuario;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "usuario_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "nome_usuario")
    private String nomeUsuario;

    @Column(unique = true)
    private String email;

    private String senha;

    @Enumerated(EnumType.STRING)
    private CategoriaUsuario categoria;

    @Column(columnDefinition = "boolean default false")
    private boolean ativo;

    @ManyToMany
    @JoinTable(
            name = "usuario_unidade",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "unidade_atendimento_id")
    )
    private List<UnidadeAtendimento> unidades;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setor_id")
    private Setor setor;

}
