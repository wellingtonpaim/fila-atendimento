package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.mapper.UsuarioMapper;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.repository.UsuarioRepository;
import com.wjbc.fila_atendimento.domain.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceImplTest {
    @Mock UsuarioRepository usuarioRepository;
    @Mock UsuarioMapper usuarioMapper;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks UsuarioServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test void criarUsuario_sucesso() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, List.of(UUID.randomUUID()));
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(dto.email()); usuario.setNomeUsuario(dto.nomeUsuario()); usuario.setSenha(dto.senha()); usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR); usuario.setAtivo(true);
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), List.of(UUID.randomUUID()));
        when(usuarioMapper.toEntity(dto)).thenReturn(usuario);
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.criar(dto);
        assertNotNull(result);
        assertEquals(dto.email(), result.email());
    }

    @Test void buscarPorId_usuarioNaoExiste() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.buscarPorId(id));
    }

    @Test void buscarPorEmail_sucesso() {
        String email = "email@email.com";
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(email); usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR);
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), List.of(UUID.randomUUID()));
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.buscarPorEmail(email);
        assertNotNull(result);
        assertEquals(email, result.email());
    }

    @Test void desativarUsuario_sucesso() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioRepository).delete(usuario);
        assertDoesNotThrow(() -> service.desativar(id));
    }
}
