import { ApiResponse, ClienteCreateDTO, ClienteResponseDTO, ClienteUpdateDTO } from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

export const clienteService = {
  /**
   * Lista todos os clientes
   */
  async listarTodos(): Promise<ApiResponse<ClienteResponseDTO[]>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao listar clientes: ${res.statusText}`);
    return res.json();
  },

  /**
   * Cria novo cliente
   */
  async criar(cliente: ClienteCreateDTO): Promise<ApiResponse<ClienteResponseDTO>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(cliente),
    });
    if (!res.ok) throw new Error(`Erro ao criar cliente: ${res.statusText}`);
    return res.json();
  },

  /**
   * Busca cliente por ID
   */
  async buscarPorId(id: string): Promise<ApiResponse<ClienteResponseDTO>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar cliente: ${res.statusText}`);
    return res.json();
  },

  /**
   * Substitui cliente por ID
   */
  async substituir(id: string, cliente: ClienteCreateDTO): Promise<ApiResponse<ClienteResponseDTO>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(cliente),
    });
    if (!res.ok) throw new Error(`Erro ao substituir cliente: ${res.statusText}`);
    return res.json();
  },

  /**
   * Atualiza cliente parcialmente
   */
  async atualizarParcialmente(id: string, cliente: ClienteUpdateDTO): Promise<ApiResponse<ClienteResponseDTO>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(cliente),
    });
    if (!res.ok) throw new Error(`Erro ao atualizar cliente: ${res.statusText}`);
    return res.json();
  },

  /**
   * Desativa cliente
   */
  async desativar(id: string): Promise<ApiResponse<void>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao desativar cliente: ${res.statusText}`);
    return res.json();
  },

  /**
   * Busca clientes por nome (com paginação)
   */
  async buscarPorNome(nome: string, page?: number, size?: number): Promise<ApiResponse<ClienteResponseDTO[]>> {
    let url = `${API_BASE_URL}/api/clientes/nome/${encodeURIComponent(nome)}`;
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar clientes por nome: ${res.statusText}`);
    return res.json();
  },

  /**
   * Busca cliente por CPF
   */
  async buscarPorCpf(cpf: string): Promise<ApiResponse<ClienteResponseDTO>> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/cpf/${encodeURIComponent(cpf)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar cliente por CPF: ${res.statusText}`);
    return res.json();
  },

  /**
   * Busca clientes por email (com paginação)
   */
  async buscarPorEmail(email: string, page?: number, size?: number): Promise<ApiResponse<ClienteResponseDTO[]>> {
    let url = `${API_BASE_URL}/api/clientes/email/${encodeURIComponent(email)}`;
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar clientes por email: ${res.statusText}`);
    return res.json();
  },

  /**
   * Busca clientes por telefone (com paginação)
   */
  async buscarPorTelefone(telefone: string, page?: number, size?: number): Promise<ApiResponse<ClienteResponseDTO[]>> {
    let url = `${API_BASE_URL}/api/clientes/telefone/${encodeURIComponent(telefone)}`;
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar clientes por telefone: ${res.statusText}`);
    return res.json();
  },
};
