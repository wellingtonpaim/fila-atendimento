package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.ClienteCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteResponseDTO;
import com.wjbc.fila_atendimento.domain.dto.ClienteUpdateDTO;
import com.wjbc.fila_atendimento.domain.exception.BusinessException;
import com.wjbc.fila_atendimento.domain.exception.ResourceNotFoundException;
import com.wjbc.fila_atendimento.domain.mapper.ClienteMapper;
import com.wjbc.fila_atendimento.domain.model.Cliente;
import com.wjbc.fila_atendimento.domain.repository.ClienteRepository;
import com.wjbc.fila_atendimento.domain.repository.specification.ClienteSpecification;
import com.wjbc.fila_atendimento.domain.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    @Override
    @Transactional
    public ClienteResponseDTO criar(ClienteCreateDTO clienteDTO) {
        validarCpfEEmail(clienteDTO.cpf(), clienteDTO.email(), null);

        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        cliente.setAtivo(true);

        Cliente clienteSalvo = clienteRepository.save(cliente);
        return clienteMapper.toResponseDTO(clienteSalvo);
    }

    @Override
    @Transactional
    public ClienteResponseDTO substituir(UUID id, ClienteCreateDTO clienteDTO) {
        Cliente clienteExistente = findClienteById(id);
        validarCpfEEmail(clienteDTO.cpf(), clienteDTO.email(), id);

        clienteExistente.setCpf(clienteDTO.cpf());
        clienteExistente.setNome(clienteDTO.nome());
        clienteExistente.setEmail(clienteDTO.email());
        clienteExistente.setTelefones(clienteDTO.telefones());
        clienteExistente.setEndereco(clienteDTO.endereco());

        Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
        return clienteMapper.toResponseDTO(clienteAtualizado);
    }

    @Override
    @Transactional
    public ClienteResponseDTO atualizarParcialmente(UUID id, ClienteUpdateDTO clienteDTO) {
        Cliente clienteExistente = findClienteById(id);

        // Verifica se o e-mail está sendo alterado e se já existe para outro cliente
        if (clienteDTO.email() != null && !clienteDTO.email().equals(clienteExistente.getEmail())) {
            clienteRepository.findByEmail(clienteDTO.email()).ifPresent(cliente -> {
                if (!cliente.getId().equals(id)) {
                    throw new com.wjbc.fila_atendimento.exception.EmailDuplicadoException("E-mail '" + clienteDTO.email() + "' já está cadastrado para outro cliente.");
                }
            });
        }

        clienteMapper.applyPatchToEntity(clienteDTO, clienteExistente);

        validarCpfEEmail(clienteExistente.getCpf(), clienteExistente.getEmail(), id);

        Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
        return clienteMapper.toResponseDTO(clienteAtualizado);
    }


    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorId(UUID id) {
        Cliente cliente = findClienteById(id);
        return clienteMapper.toResponseDTO(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public Cliente findClienteById(UUID id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorCpf(String cpf) {
        Cliente cliente = clienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o CPF: " + cpf));
        return clienteMapper.toResponseDTO(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> buscarPorNomeSemelhante(String nome) {
        // Cria a specification dinamicamente com base no nome fornecido
        Specification<Cliente> spec = ClienteSpecification.porNomeSemelhante(nome);

        // Usa o metodo findAll(spec) que ganhamos ao estender JpaSpecificationExecutor
        return clienteRepository.findAll(spec).stream()
                .map(clienteMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void desativar(UUID id) {
        Cliente cliente = findClienteById(id);
        clienteRepository.delete(cliente);
    }

    private void validarCpfEEmail(String cpf, String email, UUID idExcluido) {
        clienteRepository.findByCpf(cpf).ifPresent(cliente -> {
            if (idExcluido == null || !cliente.getId().equals(idExcluido)) {
                throw new BusinessException("CPF " + cpf + " já cadastrado no sistema.");
            }
        });

        clienteRepository.findByEmail(email).ifPresent(cliente -> {
            if (idExcluido == null || !cliente.getId().equals(idExcluido)) {
                throw new com.wjbc.fila_atendimento.exception.EmailDuplicadoException("Email " + email + " já cadastrado no sistema.");
            }
        });
    }
}