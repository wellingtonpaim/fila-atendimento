package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioUpdateDTO;
import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.UsuarioMapper;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.repository.UsuarioRepository;
import com.wjbc.fila_atendimento.domain.service.UnidadeAtendimentoService;
import com.wjbc.fila_atendimento.domain.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UnidadeAtendimentoService unidadeService;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UsuarioResponseDTO criar(UsuarioCreateDTO dto) {
        validarEmail(dto.email(), null);

        Usuario novoUsuario = usuarioMapper.toEntity(dto);
        novoUsuario.setSenha(passwordEncoder.encode(dto.senha()));

        if (dto.unidadesIds() != null && !dto.unidadesIds().isEmpty()) {
            List<UnidadeAtendimento> unidades = dto.unidadesIds().stream()
                    .map(unidadeService::findUnidadeById)
                    .collect(Collectors.toList());
            novoUsuario.setUnidades(unidades);
        } else {
            novoUsuario.setUnidades(Collections.emptyList());
        }

        novoUsuario.setAtivo(false);
        UsuarioResponseDTO usuarioResponseDTO = usuarioMapper.toResponseDTO(usuarioRepository.save(novoUsuario));
        return usuarioResponseDTO;
    }

    @Override
    @Transactional
    public UsuarioResponseDTO atualizarParcialmente(UUID id, UsuarioUpdateDTO dto) {
        Usuario usuarioExistente = findUsuarioById(id);

        List<UnidadeAtendimento> unidades = null;
        if (dto.unidadesIds() != null) {
            unidades = dto.unidadesIds().stream()
                    .map(unidadeService::findUnidadeById)
                    .collect(Collectors.toList());
        }

        usuarioMapper.applyPatchToEntity(dto, usuarioExistente, unidades);
        validarEmail(usuarioExistente.getEmail(), id);

        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuarioExistente));
    }

    @Override
    @Transactional
    public UsuarioResponseDTO substituir(UUID id, UsuarioCreateDTO dto) {
        Usuario usuarioExistente = findUsuarioById(id);
        validarEmail(dto.email(), id);

        List<UnidadeAtendimento> unidades = dto.unidadesIds() != null
                ? dto.unidadesIds().stream().map(unidadeService::findUnidadeById).collect(Collectors.toList())
                : Collections.emptyList();

        usuarioExistente.setNomeUsuario(dto.nomeUsuario());
        usuarioExistente.setEmail(dto.email());
        usuarioExistente.setSenha(passwordEncoder.encode(dto.senha()));
        usuarioExistente.setCategoria(dto.categoria());
        usuarioExistente.setUnidades(unidades);

        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuarioExistente));
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        Usuario usuario = findUsuarioById(id);
        usuarioRepository.delete(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(UUID id) {
        return usuarioMapper.toResponseDTO(findUsuarioById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario findUsuarioById(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o email: " + email));
        return usuarioMapper.toResponseDTO(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario findUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o email: " + email));
    }

    private void validarEmail(String email, UUID idExcluido) {
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            if (idExcluido == null || !usuario.getId().equals(idExcluido)) {
                throw new BusinessException("Email " + email + " já cadastrado no sistema.");
            }
        });
    }

    @Override
    @Transactional
    public UsuarioResponseDTO promoverParaAdministrador(UUID id) {
        Usuario usuario = findUsuarioById(id);

        if (usuario.getCategoria() == CategoriaUsuario.ADMINISTRADOR) {
            throw new BusinessException("Usuário já é administrador.");
        }

        usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR);
        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuario));
    }
}