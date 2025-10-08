package com.wjbc.fila_atendimento.domain.exception.handler;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.exception.ApiIllegalArgumentException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidacaoCampos(MethodArgumentNotValidException ex) {
        String nomeEntidade = "entidade desconhecida";
        if (ex.getBindingResult().getTarget() != null) {
            nomeEntidade = ex.getBindingResult().getTarget().getClass().getSimpleName().replace("DTO", "");
        }

        List<String> mensagensErro = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erro -> "Campo '" + erro.getField() + "' " + erro.getDefaultMessage())
                .collect(Collectors.toList());

        String mensagem = "Todos os campos de " + nomeEntidade + " são obrigatórios. Verifique e tente novamente.";

        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                mensagem,
                null,
                mensagensErro,
                new Date()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        String mensagem = ex.getMessage();
        List<String> erros = List.of("Erro de argumento: " + mensagem);
        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                "Erro ao processar a requisição.",
                null,
                erros,
                new Date()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    @ExceptionHandler(ApiIllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiIllegalArgument(ApiIllegalArgumentException ex) {
        String suggestion = determineSuggestion(ex.getEntity(), ex.getField(), ex.getValue());
        List<String> erros = List.of(
                ex.getMessage(),
                "Campo: " + ex.getField(),
                "Valor: " + ex.getValue(),
                "Sugestão: " + suggestion
        );

        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                "Erro relacionado à entidade " + ex.getEntity(),
                null,
                erros,
                new Date()
        );

        return ResponseEntity.status(ex.getStatus()).body(resposta);
    }

    private String determineSuggestion(String entity, String field, Object value) {
        if (entity.equalsIgnoreCase("Fornecedor") && field.equalsIgnoreCase("CPF/CNPJ")) {
            return "Verifique se o fornecedor com " + field + " " + value + " está cadastrado no sistema.";
        } else if (entity.equalsIgnoreCase("Produto")) {
            return "Verifique os dados do produto e certifique-se de que todos os relacionamentos estão corretos.";
        }
        return "Verifique os dados fornecidos e tente novamente.";
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String mensagem = "Erro ao interpretar os dados enviados. Verifique o formato e os valores informados.";

        List<String> detalhes;

        // Tenta identificar o motivo específico (como valor inválido para enum)
        Throwable causa = ex.getCause();
        if (causa instanceof InvalidFormatException ife) {
            String campo = ife.getPath().stream()
                    .map(ref -> ref.getFieldName())
                    .collect(Collectors.joining("."));
            String valorInvalido = ife.getValue().toString();
            String tipoEsperado = ife.getTargetType().getSimpleName();

            String detalhe = "Campo '" + campo + "' recebeu o valor inválido '" + valorInvalido +
                    "'. Esperado: um valor compatível com " + tipoEsperado + ".";

            detalhes = List.of(detalhe);
        } else {
            detalhes = List.of(ex.getMostSpecificCause().getMessage());
        }

        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                mensagem,
                null,
                detalhes,
                new Date()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoSuchElement(java.util.NoSuchElementException ex) {
        String mensagem = ex.getMessage() != null ? ex.getMessage() : "Recurso não encontrado";
        List<String> erros = List.of("O recurso solicitado não foi encontrado no sistema");

        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                mensagem,
                null,
                erros,
                new Date()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resposta);
    }

    @ExceptionHandler(com.wjbc.fila_atendimento.exception.EmailDuplicadoException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmailDuplicadoException(com.wjbc.fila_atendimento.exception.EmailDuplicadoException ex) {
        List<String> erros = List.of(ex.getMessage());
        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                "E-mail já cadastrado",
                null,
                erros,
                new Date()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(resposta);
    }

    @ExceptionHandler(com.wjbc.fila_atendimento.domain.exception.BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(com.wjbc.fila_atendimento.domain.exception.BusinessException ex) {
        List<String> erros = List.of(ex.getMessage());
        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                ex.getMessage(),
                null,
                erros,
                new Date()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    @ExceptionHandler(com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException ex) {
        List<String> erros = List.of(ex.getMessage());
        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                ex.getMessage(),
                null,
                erros,
                new Date()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resposta);
    }

    @ExceptionHandler(com.wjbc.fila_atendimento.domain.dashboard.exception.DashboardDataNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleDashboardDataNotFound(com.wjbc.fila_atendimento.domain.dashboard.exception.DashboardDataNotFoundException ex) {
        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                ex.getMessage(),
                null,
                List.of("Nenhum dado encontrado para os filtros informados."),
                new Date()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resposta);
    }

    // Handler genérico para capturar todas as exceções não tratadas especificamente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        // Log da exceção completa para debug
        System.err.println("Exceção não tratada capturada pelo handler genérico:");
        ex.printStackTrace();

        String mensagemErro = ex.getMessage() != null ? ex.getMessage() : "Erro interno do servidor";
        String tipoExcecao = ex.getClass().getSimpleName();

        List<String> erros = List.of(
                "Tipo da exceção: " + tipoExcecao,
                "Mensagem: " + mensagemErro,
                "Esta exceção não possui um handler específico"
        );

        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                "Erro interno do servidor - " + tipoExcecao,
                null,
                erros,
                new Date()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resposta);
    }

    // Handler específico para exceções de acesso a dados (SQL, Hibernate, etc.)
    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataAccessException(org.springframework.dao.DataAccessException ex) {
        String mensagemOriginal = ex.getMessage();
        String mensagemSimplificada = "Erro ao acessar o banco de dados";

        // Tenta extrair uma mensagem mais clara para erros comuns
        if (mensagemOriginal != null) {
            if (mensagemOriginal.contains("relation") && mensagemOriginal.contains("does not exist")) {
                mensagemSimplificada = "Tabela ou campo não encontrado no banco de dados";
            } else if (mensagemOriginal.contains("constraint")) {
                mensagemSimplificada = "Violação de restrição do banco de dados";
            } else if (mensagemOriginal.contains("duplicate")) {
                mensagemSimplificada = "Dados duplicados encontrados";
            }
        }

        List<String> erros = List.of(
                "Erro de acesso a dados",
                "Mensagem original: " + mensagemOriginal,
                "Verifique se as tabelas e relacionamentos estão corretos"
        );

        ApiResponse<Void> resposta = new ApiResponse<>(
                false,
                mensagemSimplificada,
                null,
                erros,
                new Date()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resposta);
    }

}
