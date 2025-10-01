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
        validarCpf(clienteDTO.cpf(), null);

        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        cliente.setAtivo(true);

        Cliente clienteSalvo = clienteRepository.save(cliente);
        return clienteMapper.toResponseDTO(clienteSalvo);
    }

    @Override
    @Transactional
    public ClienteResponseDTO substituir(UUID id, ClienteCreateDTO clienteDTO) {
        Cliente clienteExistente = findClienteById(id);
        validarCpf(clienteDTO.cpf(), id);

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
        clienteMapper.applyPatchToEntity(clienteDTO, clienteExistente);
        validarCpf(clienteExistente.getCpf(), id);
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

    public List<ClienteResponseDTO> buscarPorEmail(String email, Integer page, Integer size) {
        List<Cliente> clientes = clienteRepository.findAllByEmail(email);
        return paginarEConverter(clientes, page, size);
    }

    public List<ClienteResponseDTO> buscarPorTelefone(String telefone, Integer page, Integer size) {
        List<Cliente> clientes = clienteRepository.findAllByTelefone(telefone);
        return paginarEConverter(clientes, page, size);
    }

    private List<ClienteResponseDTO> paginarEConverter(List<Cliente> clientes, Integer page, Integer size) {
        if (page != null && size != null && page >= 0 && size > 0) {
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, clientes.size());
            if (fromIndex > clientes.size()) {
                return List.of();
            }
            clientes = clientes.subList(fromIndex, toIndex);
        }
        return clientes.stream().map(clienteMapper::toResponseDTO).collect(Collectors.toList());
    }

    private void validarCpf(String cpf, UUID idExcluido) {
        clienteRepository.findByCpf(cpf).ifPresent(cliente -> {
            if (idExcluido == null || !idExcluido.equals(cliente.getId())) {
                throw new BusinessException("CPF " + cpf + " já cadastrado no sistema.");
            }
        });
    }
}