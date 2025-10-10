package com.wjbc.fila_atendimento.security.model;

import com.wjbc.fila_atendimento.domain.model.Usuario;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "password_reset_token", schema = "fila_atendimento")
public class PasswordResetToken {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public PasswordResetToken() {
        this.expiryDate = LocalDateTime.now().plusHours(1); // 1 hora de expiração
    }

    public PasswordResetToken(String token, Usuario usuario) {
        this();
        this.token = token;
        this.usuario = usuario;
    }
}

