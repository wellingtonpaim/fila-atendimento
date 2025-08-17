package com.wjbc.fila_atendimento.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private Date timestamp = new Date();

    public ApiResponse(boolean success, String message, T data) {
        this(success, message, data, null, new Date());
    }

    public ApiResponse(boolean success, String message) {
        this(success, message, null, null, new Date());
    }

    public ApiResponse(boolean success, String message, List<String> errors) {
        this(success, message, null, errors, new Date());
    }
}

