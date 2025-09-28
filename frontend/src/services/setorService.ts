import { ApiResponse, SetorCreateDTO, SetorResponseDTO, SetorUpdateDTO } from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

export const setorService = {
  // Criar um novo setor
  async criar(setor: SetorCreateDTO): Promise<ApiResponse<SetorResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/setores`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(setor)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar setor: ${response.statusText}`);
    }

    return response.json();
  },

  // Listar todos os setores
  async listarTodos(): Promise<ApiResponse<SetorResponseDTO[]>> {
    const response = await fetch(`${API_BASE_URL}/api/setores`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar setores: ${response.statusText}`);
    }

    return response.json();
  },

  // Buscar setor por ID
  async buscarPorId(id: string): Promise<ApiResponse<SetorResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar setor: ${response.statusText}`);
    }

    return response.json();
  },

  // Buscar setores por nome
  async buscarPorNome(nome: string): Promise<ApiResponse<SetorResponseDTO[]>> {
    const response = await fetch(`${API_BASE_URL}/api/setores/nome/${encodeURIComponent(nome)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar setores por nome: ${response.statusText}`);
    }

    return response.json();
  },

  // Substituir setor completamente
  async substituir(id: string, setor: SetorCreateDTO): Promise<ApiResponse<SetorResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(setor)
    });

    if (!response.ok) {
      throw new Error(`Erro ao substituir setor: ${response.statusText}`);
    }

    return response.json();
  },

  // Atualizar setor parcialmente
  async atualizarParcialmente(id: string, setor: SetorUpdateDTO): Promise<ApiResponse<SetorResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(setor)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar setor: ${response.statusText}`);
    }

    return response.json();
  },

  // Desativar setor
  async desativar(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao desativar setor: ${response.statusText}`);
    }

    return response.json();
  }
};
