package com.wjbc.fila_atendimento.domain.service;

import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioUpdateDTO;
import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.mapper.UsuarioMapper;
import com.wjbc.fila_atendimento.domain.model.UnidadeAtendimento;
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
    @Mock UnidadeAtendimentoService unidadeService;
    @InjectMocks UsuarioServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test void criarUsuario_sucesso() {
        UUID unidadeId = UUID.randomUUID();
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, List.of(unidadeId));
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(dto.email()); usuario.setNomeUsuario(dto.nomeUsuario()); usuario.setSenha(dto.senha()); usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR); usuario.setAtivo(true);
        UnidadeAtendimento unidade = new UnidadeAtendimento(); unidade.setId(unidadeId);
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), List.of(unidadeId));
        when(usuarioMapper.toEntity(dto)).thenReturn(usuario);
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(unidadeService.findUnidadeById(unidadeId)).thenReturn(unidade);
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.criar(dto);
        assertNotNull(result);
        assertEquals(dto.email(), result.email());
    }

    @Test void criarUsuario_emailJaCadastrado_lancaBusinessException() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, null);
        Usuario usuarioExistente = new Usuario(); usuarioExistente.setId(UUID.randomUUID()); usuarioExistente.setEmail(dto.email());
        when(usuarioRepository.findByEmail(dto.email())).thenReturn(Optional.of(usuarioExistente));
        assertThrows(com.wjbc.fila_atendimento.domain.exception.BusinessException.class, () -> service.criar(dto));
    }

    @Test void buscarPorId_usuarioNaoExiste() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.buscarPorId(id));
    }

    @Test void buscarPorId_sucesso() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(id, "Nome", "email@email.com", CategoriaUsuario.ADMINISTRADOR, List.of(UUID.randomUUID()));
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.buscarPorId(id);
        assertNotNull(result);
        assertEquals(id, result.id());
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

    @Test void buscarPorEmail_usuarioNaoExiste() {
        String email = "naoexiste@email.com";
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.empty());
        assertThrows(com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException.class, () -> service.buscarPorEmail(email));
    }

    @Test void desativarUsuario_sucesso() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioRepository).delete(usuario);
        assertDoesNotThrow(() -> service.desativar(id));
    }

    @Test void desativarUsuario_usuarioNaoExiste_lancaResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException.class, () -> service.desativar(id));
    }

    @Test void atualizarParcialmente_sucesso() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioUpdateDTO dto = new UsuarioUpdateDTO("NovoNome", "novo@email.com", null, null);
        UnidadeAtendimento unidade = new UnidadeAtendimento(); unidade.setId(UUID.randomUUID());
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioMapper).applyPatchToEntity(eq(dto), eq(usuario), any());
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "NovoNome", "novo@email.com", CategoriaUsuario.ADMINISTRADOR, List.of(unidade.getId())));
        UsuarioResponseDTO result = service.atualizarParcialmente(id, dto);
        assertNotNull(result);
    }

    @Test void atualizarParcialmente_emailJaCadastrado_lancaBusinessException() {
        UUID id = UUID.randomUUID();
        Usuario usuarioExistente = new Usuario(); usuarioExistente.setId(id); usuarioExistente.setEmail("email@email.com");
        Usuario usuarioOutro = new Usuario(); usuarioOutro.setId(UUID.randomUUID()); usuarioOutro.setEmail("email@email.com");
        UsuarioUpdateDTO dto = new UsuarioUpdateDTO("NovoNome", "email@email.com", null, null);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByEmail("email@email.com")).thenReturn(Optional.of(usuarioOutro));
        doNothing().when(usuarioMapper).applyPatchToEntity(eq(dto), eq(usuarioExistente), any());
        assertThrows(com.wjbc.fila_atendimento.domain.exception.BusinessException.class, () -> service.atualizarParcialmente(id, dto));
    }

    @Test void atualizarParcialmente_todosCamposNulos() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioUpdateDTO dto = new UsuarioUpdateDTO(null, null, null, null);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioMapper).applyPatchToEntity(eq(dto), eq(usuario), isNull());
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, null, "email@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        UsuarioResponseDTO result = service.atualizarParcialmente(id, dto);
        assertNotNull(result);
    }

    @Test void substituirUsuario_sucesso() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioCreateDTO dto = new UsuarioCreateDTO("NovoNome", "novo@email.com", "novaSenha", CategoriaUsuario.ADMINISTRADOR, List.of(UUID.randomUUID()));
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "NovoNome", "novo@email.com", CategoriaUsuario.ADMINISTRADOR, dto.unidadesIds()));
        UsuarioResponseDTO result = service.substituir(id, dto);
        assertNotNull(result);
    }

    @Test void substituirUsuario_emailJaCadastrado_lancaBusinessException() {
        UUID id = UUID.randomUUID();
        Usuario usuarioExistente = new Usuario(); usuarioExistente.setId(id); usuarioExistente.setEmail("email@email.com");
        Usuario usuarioOutro = new Usuario(); usuarioOutro.setId(UUID.randomUUID()); usuarioOutro.setEmail("email@email.com");
        UsuarioCreateDTO dto = new UsuarioCreateDTO("NovoNome", "email@email.com", "novaSenha", CategoriaUsuario.ADMINISTRADOR, null);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByEmail("email@email.com")).thenReturn(Optional.of(usuarioOutro));
        assertThrows(com.wjbc.fila_atendimento.domain.exception.BusinessException.class, () -> service.substituir(id, dto));
    }

    @Test void listarTodos_sucesso() {
        Usuario usuario1 = new Usuario(); usuario1.setId(UUID.randomUUID()); usuario1.setEmail("email1@email.com");
        Usuario usuario2 = new Usuario(); usuario2.setId(UUID.randomUUID()); usuario2.setEmail("email2@email.com");
        UsuarioResponseDTO dto1 = new UsuarioResponseDTO(usuario1.getId(), "Nome1", "email1@email.com", CategoriaUsuario.ADMINISTRADOR, List.of(UUID.randomUUID()));
        UsuarioResponseDTO dto2 = new UsuarioResponseDTO(usuario2.getId(), "Nome2", "email2@email.com", CategoriaUsuario.ADMINISTRADOR, List.of(UUID.randomUUID()));
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario1, usuario2));
        when(usuarioMapper.toResponseDTO(usuario1)).thenReturn(dto1);
        when(usuarioMapper.toResponseDTO(usuario2)).thenReturn(dto2);
        List<UsuarioResponseDTO> result = service.listarTodos();
        assertEquals(2, result.size());
    }

    @Test void listarTodos_listaVazia() {
        when(usuarioRepository.findAll()).thenReturn(List.of());
        List<UsuarioResponseDTO> result = service.listarTodos();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test void findUsuarioById_sucesso() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        Usuario result = service.findUsuarioById(id);
        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test void findUsuarioById_usuarioNaoExiste() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException.class, () -> service.findUsuarioById(id));
    }

    @Test void findUsuarioByEmail_sucesso() {
        String email = "email@email.com";
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(email);
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(usuario));
        Usuario result = service.findUsuarioByEmail(email);
        assertNotNull(result);
        assertEquals(email, result.getEmail());
    }

    @Test void findUsuarioByEmail_usuarioNaoExiste() {
        String email = "naoexiste@email.com";
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.empty());
        assertThrows(com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException.class, () -> service.findUsuarioByEmail(email));
    }

    @Test void criarUsuario_semUnidades() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, null);
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(dto.email()); usuario.setNomeUsuario(dto.nomeUsuario()); usuario.setSenha(dto.senha()); usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR); usuario.setAtivo(true);
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), List.of());
        when(usuarioMapper.toEntity(dto)).thenReturn(usuario);
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.criar(dto);
        assertNotNull(result);
        assertTrue(result.unidadesIds().isEmpty());
    }

    @Test void atualizarParcialmente_semAlterarUnidades() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioUpdateDTO dto = new UsuarioUpdateDTO("NovoNome", "novo@email.com", CategoriaUsuario.ADMINISTRADOR, null);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioMapper).applyPatchToEntity(eq(dto), eq(usuario), isNull());
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "NovoNome", "novo@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        UsuarioResponseDTO result = service.atualizarParcialmente(id, dto);
        assertNotNull(result);
    }

    @Test void substituirUsuario_emailJaCadastradoMesmoId_naoLancaExcecao() {
        UUID id = UUID.randomUUID();
        Usuario usuarioExistente = new Usuario(); usuarioExistente.setId(id); usuarioExistente.setEmail("email@email.com");
        UsuarioCreateDTO dto = new UsuarioCreateDTO("NovoNome", "email@email.com", "novaSenha", CategoriaUsuario.ADMINISTRADOR, List.of());
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByEmail("email@email.com")).thenReturn(Optional.of(usuarioExistente));
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuarioExistente);
        when(usuarioMapper.toResponseDTO(usuarioExistente)).thenReturn(new UsuarioResponseDTO(id, "NovoNome", "email@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        assertDoesNotThrow(() -> service.substituir(id, dto));
    }

    @Test void atualizarParcialmente_unidadesNaoNulaVazia() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id);
        UsuarioUpdateDTO dto = new UsuarioUpdateDTO("Nome", "email@email.com", CategoriaUsuario.ADMINISTRADOR, List.of());
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioMapper).applyPatchToEntity(eq(dto), eq(usuario), eq(List.of()));
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "Nome", "email@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        UsuarioResponseDTO result = service.atualizarParcialmente(id, dto);
        assertNotNull(result);
        assertTrue(result.unidadesIds().isEmpty());
    }

    @Test void substituirUsuario_unidadesNaoNulaVazia() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id);
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, List.of());
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "Nome", "email@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        UsuarioResponseDTO result = service.substituir(id, dto);
        assertNotNull(result);
        assertTrue(result.unidadesIds().isEmpty());
    }

    @Test void desativarUsuario_jaDesativado() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setAtivo(false);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioRepository).delete(usuario);
        assertDoesNotThrow(() -> service.desativar(id));
    }

    @Test void criarUsuario_unidadesNula() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, null);
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(dto.email()); usuario.setNomeUsuario(dto.nomeUsuario()); usuario.setSenha(dto.senha()); usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR); usuario.setAtivo(true);
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), List.of());
        when(usuarioMapper.toEntity(dto)).thenReturn(usuario);
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.criar(dto);
        assertNotNull(result);
        assertEquals(dto.email(), result.email());
    }

    @Test void criarUsuario_unidadesVazia() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("Nome", "email@email.com", "senha", CategoriaUsuario.ADMINISTRADOR, List.of());
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setEmail(dto.email()); usuario.setNomeUsuario(dto.nomeUsuario()); usuario.setSenha(dto.senha()); usuario.setCategoria(CategoriaUsuario.ADMINISTRADOR); usuario.setAtivo(true);
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getCategoria(), List.of());
        when(usuarioMapper.toEntity(dto)).thenReturn(usuario);
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(usuarioResponseDTO);
        UsuarioResponseDTO result = service.criar(dto);
        assertNotNull(result);
        assertEquals(dto.email(), result.email());
    }

    @Test void substituirUsuario_unidadesNula() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioCreateDTO dto = new UsuarioCreateDTO("NovoNome", "novo@email.com", "novaSenha", CategoriaUsuario.ADMINISTRADOR, null);
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "NovoNome", "novo@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        UsuarioResponseDTO result = service.substituir(id, dto);
        assertNotNull(result);
    }

    @Test void substituirUsuario_unidadesVazia() {
        UUID id = UUID.randomUUID();
        Usuario usuario = new Usuario(); usuario.setId(id); usuario.setEmail("email@email.com");
        UsuarioCreateDTO dto = new UsuarioCreateDTO("NovoNome", "novo@email.com", "novaSenha", CategoriaUsuario.ADMINISTRADOR, List.of());
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode(any())).thenReturn("senhaCodificada");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(new UsuarioResponseDTO(id, "NovoNome", "novo@email.com", CategoriaUsuario.ADMINISTRADOR, List.of()));
        UsuarioResponseDTO result = service.substituir(id, dto);
        assertNotNull(result);
    }
}
