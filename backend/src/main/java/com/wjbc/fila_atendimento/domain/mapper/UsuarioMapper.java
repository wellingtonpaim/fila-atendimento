package com.wjbc.fila_atendimento.domain.mapper;

import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioCreateDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNomeUsuario(dto.nomeUsuario());
        usuario.setEmail(dto.email());
        usuario.setSenha(dto.senha());
        usuario.setCategoria(dto.categoria());
        return usuario;
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        List<UUID> unidadesIds = usuario.getUnidades() != null
                ? usuario.getUnidades().stream().map(UnidadeAtendimento::getId).collect(Collectors.toList())
                : Collections.emptyList();
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), unidadesIds);
    }

    public void applyPatchToEntity(UsuarioUpdateDTO dto, Usuario usuario, List<UnidadeAtendimento> unidades) {
        if (dto.nomeUsuario() != null) {
            usuario.setNomeUsuario(dto.nomeUsuario());
        }
        if (dto.email() != null) {
            usuario.setEmail(dto.email());
        }
        if (dto.categoria() != null) {
            usuario.setCategoria(dto.categoria());
        }
        if (unidades != null) { // A lista de unidades é sempre substituída
            usuario.setUnidades(unidades);
        }
    }
}