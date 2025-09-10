package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioUpdateDTO;
import com.wjbc.fila_atendimento.domain.model.Usuario;

import java.util.List;
import java.util.UUID;

public interface UsuarioService {
    UsuarioResponseDTO criar(UsuarioCreateDTO usuarioDTO);
    UsuarioResponseDTO atualizarParcialmente(UUID id, UsuarioUpdateDTO usuarioDTO);
    UsuarioResponseDTO substituir(UUID id, UsuarioCreateDTO usuarioDTO);
    UsuarioResponseDTO buscarPorId(UUID id);
    List<UsuarioResponseDTO> listarTodos();
    void desativar(UUID id);
    Usuario findUsuarioById(UUID id);
    UsuarioResponseDTO buscarPorEmail(String email);
    Usuario findUsuarioByEmail(String email);
    UsuarioResponseDTO promoverParaAdministrador(UUID id);
}