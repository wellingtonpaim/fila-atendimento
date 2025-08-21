package com.wjbc.fila_atendimento.domain.repository.specification;

import com.wjbc.fila_atendimento.domain.model.Cliente;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ClienteSpecification {

    public static Specification<Cliente> porNomeSemelhante(String nome) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(nome)) {
                return criteriaBuilder.conjunction();
            }

            // Quebra o termo de busca em palavras individuais.
            String[] palavras = nome.trim().split("\\s+");

            List<Predicate> predicates = new ArrayList<>();

            for (String palavra : palavras) {
                // Para cada palavra, cria uma cláusula LIKE.
                // A mágica acontece aqui:
                // 1. criteriaBuilder.function('unaccent', ...): Chama a função unaccent do PostgreSQL.
                // 2. criteriaBuilder.lower(...): Converte tanto o nome no banco quanto a palavra de busca para minúsculas.
                // 3. criteriaBuilder.like(..., "%palavra%"): Cria o `LIKE '%palavra%'`.
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.function("unaccent", String.class, criteriaBuilder.lower(root.get("nome"))),
                                "%" + removerAcentos(palavra.toLowerCase()) + "%"
                        )
                );
            }

            // Combina todas as cláusulas LIKE com um AND.
            // O cliente só será retornado se o nome contiver TODAS as palavras buscadas.
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Função utilitária para remover acentos no lado da aplicação, garantindo consistência.
    private static String removerAcentos(String str) {
        return java.text.Normalizer.normalize(str, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }
}
