package com.wjbc.fila_atendimento.domain.dashboard.repository.query;

public class DashboardQueries {
    public static final String TEMPO_ESPERA = "SELECT f.nome, s.nome, u.nome, AVG(EXTRACT(EPOCH FROM (ef.data_hora_chamada - ef.data_hora_entrada))/60) as tempo_medio, MIN(ef.data_hora_entrada), MAX(ef.data_hora_entrada) " +
            "FROM fila_atendimento.entrada_fila ef " +
            "JOIN fila_atendimento.fila f ON ef.fila_id = f.id " +
            "JOIN fila_atendimento.setor s ON f.setor_id = s.id " +
            "JOIN fila_atendimento.unidade_atendimento u ON f.unidade_atendimento_id = u.id " +
            "WHERE u.id = :unidadeId AND ef.data_hora_entrada BETWEEN :inicio AND :fim " +
            "GROUP BY f.nome, s.nome, u.nome";

    public static final String PRODUTIVIDADE = "SELECT u.nome_usuario, s.nome, ua.nome, COUNT(ef.id), AVG(EXTRACT(EPOCH FROM (ef.data_hora_saida - ef.data_hora_chamada))/60) " +
            "FROM fila_atendimento.entrada_fila ef " +
            "JOIN fila_atendimento.usuario u ON ef.usuario_responsavel_id = u.id " +
            "JOIN fila_atendimento.fila f ON ef.fila_id = f.id " +
            "JOIN fila_atendimento.setor s ON f.setor_id = s.id " +
            "JOIN fila_atendimento.unidade_atendimento ua ON f.unidade_atendimento_id = ua.id " +
            "WHERE ua.id = :unidadeId AND ef.data_hora_chamada BETWEEN :inicio AND :fim " +
            "GROUP BY u.nome_usuario, s.nome, ua.nome";

    public static final String HORARIO_PICO = "SELECT ua.nome, s.nome, date_trunc('hour', ef.data_hora_entrada) as horario, COUNT(ef.id) " +
            "FROM fila_atendimento.entrada_fila ef " +
            "JOIN fila_atendimento.fila f ON ef.fila_id = f.id " +
            "JOIN fila_atendimento.setor s ON f.setor_id = s.id " +
            "JOIN fila_atendimento.unidade_atendimento ua ON f.unidade_atendimento_id = ua.id " +
            "WHERE ua.id = :unidadeId AND ef.data_hora_entrada BETWEEN :inicio AND :fim " +
            "GROUP BY ua.nome, s.nome, horario ORDER BY horario";

    public static final String FLUXO_PACIENTES = "SELECT ua.nome, s1.nome, COUNT(ef.id) " +
            "FROM fila_atendimento.entrada_fila ef " +
            "JOIN fila_atendimento.fila f1 ON ef.fila_id = f1.id " +
            "JOIN fila_atendimento.setor s1 ON f1.setor_id = s1.id " +
            "JOIN fila_atendimento.unidade_atendimento ua ON f1.unidade_atendimento_id = ua.id " +
            "WHERE ua.id = :unidadeId AND ef.data_hora_entrada BETWEEN :inicio AND :fim " +
            "GROUP BY ua.nome, s1.nome";
}

