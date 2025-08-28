package com.wjbc.fila_atendimento.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wjbc.fila_atendimento.domain.dto.SetorCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorUpdateDTO;
import com.wjbc.fila_atendimento.domain.dto.SetorResponseDTO;
import com.wjbc.fila_atendimento.domain.exception.handler.GlobalExceptionHandler;
import com.wjbc.fila_atendimento.domain.service.SetorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SetorController.class)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class SetorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SetorService setorService;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID id;
    private SetorResponseDTO setorResponse;
    private SetorCreateDTO setorCreateDTO;
    private SetorUpdateDTO setorUpdateDTO;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        setorResponse = new SetorResponseDTO(id, "Setor Teste");
        setorCreateDTO = new SetorCreateDTO("Setor Teste");
        setorUpdateDTO = new SetorUpdateDTO("Setor Atualizado");
    }

    @Test
    void listarTodos_deveRetornarLista() throws Exception {
        List<SetorResponseDTO> setores = List.of(setorResponse);
        Mockito.when(setorService.listarTodos()).thenReturn(setores);

        mockMvc.perform(get("/api/setores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(id.toString()))
                .andExpect(jsonPath("$[0].nome").value("Setor Teste"));
    }

    @Test
    void listarTodos_deveRetornarListaVazia() throws Exception {
        Mockito.when(setorService.listarTodos()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/setores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void buscarPorId_deveRetornarSetor() throws Exception {
        Mockito.when(setorService.buscarPorId(id)).thenReturn(setorResponse);

        mockMvc.perform(get("/api/setores/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nome").value("Setor Teste"));
    }

    @Test
    void buscarPorId_naoEncontrado() throws Exception {
        UUID idInexistente = UUID.randomUUID();
        Mockito.when(setorService.buscarPorId(idInexistente)).thenThrow(new NoSuchElementException("Setor não encontrado"));

        mockMvc.perform(get("/api/setores/{id}", idInexistente))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Setor não encontrado"));
    }

    @Test
    void buscarPorNomeContendo_deveRetornarLista() throws Exception {
        String nome = "Teste";
        List<SetorResponseDTO> setores = List.of(setorResponse);
        Mockito.when(setorService.buscarPorNomeContendo(nome)).thenReturn(setores);

        mockMvc.perform(get("/api/setores/nome/{nome}", nome))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].nome").value("Setor Teste"));
    }

    @Test
    void buscarPorNomeContendo_deveRetornarListaVazia() throws Exception {
        String nome = "Inexistente";
        Mockito.when(setorService.buscarPorNomeContendo(nome)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/setores/nome/{nome}", nome))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void criar_deveRetornarSetorCriado() throws Exception {
        Mockito.when(setorService.criar(any(SetorCreateDTO.class))).thenReturn(setorResponse);

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(setorCreateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nome").value("Setor Teste"));
    }

    @Test
    void criar_comDadosInvalidos_deveRetornarBadRequest() throws Exception {
        SetorCreateDTO dtoInvalido = new SetorCreateDTO(""); // Nome vazio

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void criar_comNomeNulo_deveRetornarBadRequest() throws Exception {
        SetorCreateDTO dtoInvalido = new SetorCreateDTO(null);

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void substituir_deveRetornarSetorAtualizado() throws Exception {
        SetorResponseDTO setorAtualizado = new SetorResponseDTO(id, "Novo Nome");
        Mockito.when(setorService.substituir(eq(id), any(SetorCreateDTO.class))).thenReturn(setorAtualizado);

        SetorCreateDTO dto = new SetorCreateDTO("Novo Nome");
        mockMvc.perform(put("/api/setores/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nome").value("Novo Nome"));
    }

    @Test
    void substituir_naoEncontrado_deveRetornarNotFound() throws Exception {
        UUID idInexistente = UUID.randomUUID();
        Mockito.when(setorService.substituir(eq(idInexistente), any(SetorCreateDTO.class)))
                .thenThrow(new NoSuchElementException("Setor não encontrado"));

        mockMvc.perform(put("/api/setores/{id}", idInexistente)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(setorCreateDTO)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Setor não encontrado"));
    }

    @Test
    void atualizarParcialmente_deveRetornarSetorAtualizado() throws Exception {
        SetorResponseDTO setorAtualizado = new SetorResponseDTO(id, "Setor Atualizado");
        Mockito.when(setorService.atualizarParcialmente(eq(id), any(SetorUpdateDTO.class))).thenReturn(setorAtualizado);

        mockMvc.perform(patch("/api/setores/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(setorUpdateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nome").value("Setor Atualizado"));
    }

    @Test
    void atualizarParcialmente_naoEncontrado_deveRetornarNotFound() throws Exception {
        UUID idInexistente = UUID.randomUUID();
        Mockito.when(setorService.atualizarParcialmente(eq(idInexistente), any(SetorUpdateDTO.class)))
                .thenThrow(new NoSuchElementException("Setor não encontrado"));

        mockMvc.perform(patch("/api/setores/{id}", idInexistente)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(setorUpdateDTO)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Setor não encontrado"));
    }

    @Test
    void atualizarParcialmente_comNomeNulo_devePermitir() throws Exception {
        SetorUpdateDTO dtoComNomeNulo = new SetorUpdateDTO(null);
        Mockito.when(setorService.atualizarParcialmente(eq(id), any(SetorUpdateDTO.class))).thenReturn(setorResponse);

        mockMvc.perform(patch("/api/setores/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoComNomeNulo)))
                .andExpect(status().isOk());
    }

    @Test
    void desativar_deveRetornarNoContent() throws Exception {
        Mockito.doNothing().when(setorService).desativar(id);

        mockMvc.perform(delete("/api/setores/{id}", id))
                .andExpect(status().isNoContent());
    }

    @Test
    void desativar_naoEncontrado_deveRetornarNotFound() throws Exception {
        UUID idInexistente = UUID.randomUUID();
        Mockito.doThrow(new NoSuchElementException("Setor não encontrado")).when(setorService).desativar(idInexistente);

        mockMvc.perform(delete("/api/setores/{id}", idInexistente))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Setor não encontrado"));
    }

    @Test
    void criar_comJsonMalformado_deveRetornarBadRequest() throws Exception {
        String jsonMalformado = "{ nome: 'sem aspas' }";

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMalformado))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void buscarPorNomeContendo_comCaracteresEspeciais_deveRetornarLista() throws Exception {
        String nomeComCaracteresEspeciais = "Setor & Teste";
        SetorResponseDTO setorEspecial = new SetorResponseDTO(id, nomeComCaracteresEspeciais);
        Mockito.when(setorService.buscarPorNomeContendo(nomeComCaracteresEspeciais)).thenReturn(List.of(setorEspecial));

        mockMvc.perform(get("/api/setores/nome/{nome}", nomeComCaracteresEspeciais))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value(nomeComCaracteresEspeciais));
    }

    @Test
    void criar_comNomeMuitoLongo_deveRetornarBadRequest() throws Exception {
        String nomeMuitoLongo = "A".repeat(100); // Maior que 50 caracteres
        SetorCreateDTO dtoInvalido = new SetorCreateDTO(nomeMuitoLongo);

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void criar_comNomeMuitoCurto_deveRetornarBadRequest() throws Exception {
        String nomeMuitoCurto = "AB"; // Menor que 3 caracteres
        SetorCreateDTO dtoInvalido = new SetorCreateDTO(nomeMuitoCurto);

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void substituir_comDadosInvalidos_deveRetornarBadRequest() throws Exception {
        SetorCreateDTO dtoInvalido = new SetorCreateDTO("");

        mockMvc.perform(put("/api/setores/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void atualizarParcialmente_comNomeMuitoLongo_deveRetornarBadRequest() throws Exception {
        String nomeMuitoLongo = "A".repeat(100);
        SetorUpdateDTO dtoInvalido = new SetorUpdateDTO(nomeMuitoLongo);

        mockMvc.perform(patch("/api/setores/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void buscarPorId_comIdInvalidoFormatoTexto_deveRetornarBadRequest() throws Exception {
        mockMvc.perform(get("/api/setores/{id}", "id-invalido"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void substituir_comIdInvalidoFormatoTexto_deveRetornarBadRequest() throws Exception {
        mockMvc.perform(put("/api/setores/{id}", "id-invalido")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(setorCreateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listarTodos_comMultiplosSetores_deveRetornarListaCompleta() throws Exception {
        SetorResponseDTO setor1 = new SetorResponseDTO(UUID.randomUUID(), "Setor 1");
        SetorResponseDTO setor2 = new SetorResponseDTO(UUID.randomUUID(), "Setor 2");
        SetorResponseDTO setor3 = new SetorResponseDTO(UUID.randomUUID(), "Setor 3");

        List<SetorResponseDTO> setores = List.of(setor1, setor2, setor3);
        Mockito.when(setorService.listarTodos()).thenReturn(setores);

        mockMvc.perform(get("/api/setores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].nome").value("Setor 1"))
                .andExpect(jsonPath("$[1].nome").value("Setor 2"))
                .andExpect(jsonPath("$[2].nome").value("Setor 3"));
    }

    @Test
    void criar_comEspacosEmBranco_deveRetornarBadRequest() throws Exception {
        SetorCreateDTO dtoInvalido = new SetorCreateDTO("   "); // Apenas espaços

        mockMvc.perform(post("/api/setores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void buscarPorNomeContendo_comNomeVazio_deveRetornarNotFound() throws Exception {
        String nomeVazio = "";

        mockMvc.perform(get("/api/setores/nome/{nome}", nomeVazio))
                .andExpect(status().isNotFound());
    }

    @Test
    void atualizarParcialmente_comNomeVazio_deveRetornarBadRequest() throws Exception {
        SetorUpdateDTO dtoInvalido = new SetorUpdateDTO(""); // Nome vazio

        mockMvc.perform(patch("/api/setores/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
