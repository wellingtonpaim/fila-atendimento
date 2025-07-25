package com.wjbc.fila_atendimento.security.model;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class ConfirmationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private LocalDateTime expiryDate;

    public ConfirmationToken() {
        this.expiryDate = LocalDateTime.now().plusHours(24);
    }

    public ConfirmationToken(String token, Usuario usuario) {
        this();
        this.token = token;
        this.usuario = usuario;
    }
}