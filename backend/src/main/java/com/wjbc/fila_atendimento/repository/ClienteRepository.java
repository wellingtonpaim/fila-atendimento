package com.wjbc.fila_atendimento.repository;

import com.wjbc.fila_atendimento.domain.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, String> {
}

