package com.wjbc.fila_atendimento.controller.util;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

public final class PaginationUtil {
    private PaginationUtil() {}

    public static <T> ResponseEntity<ApiResponse<List<T>>> build(List<T> fullList, Integer page, Integer size, String message) {
        if (page == null || size == null) {
            // Sem paginação: mantém comportamento atual
            return ResponseEntity.ok(new ApiResponse<>(true, message, fullList));
        }
        int total = fullList != null ? fullList.size() : 0;
        if (size <= 0) size = 10;
        if (page < 0) page = 0;
        int start = Math.min(page * size, total);
        int end = Math.min(start + size, total);
        List<T> slice = total == 0 ? Collections.emptyList() : fullList.subList(start, end);

        int totalPages = (int) Math.ceil(total / (double) size);

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(total));
        headers.add("X-Total-Pages", String.valueOf(totalPages));
        headers.add("X-Page", String.valueOf(page));
        headers.add("X-Page-Size", String.valueOf(size));
        // Content-Range no formato: items start-end/total (end é inclusivo, então end-1)
        String contentRange = String.format("items %d-%d/%d", start, Math.max(start, end - 1), total);
        headers.add("Content-Range", contentRange);

        return ResponseEntity.ok().headers(headers).body(new ApiResponse<>(true, message, slice));
    }
}

