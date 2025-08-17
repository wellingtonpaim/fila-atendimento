package com.wjbc.fila_atendimento.domain.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiIllegalArgumentException extends RuntimeException {

    private final String entity;
    private final String field;
    private final Object value;
    private final HttpStatus status;

    public ApiIllegalArgumentException(String message, String entity, String field, Object value) {
        this(message, entity, field, value, HttpStatus.BAD_REQUEST); // padrão
    }

    public ApiIllegalArgumentException(String message, String entity, String field, Object value, HttpStatus status) {
        super(message);
        this.entity = entity;
        this.field = field;
        this.value = value;
        this.status = status;
    }
}
