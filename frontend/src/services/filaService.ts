import { ApiResponse, FilaCreateDTO, FilaResponseDTO, FilaUpdateDTO } from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

export const filaService = {
  // Criar uma nova fila
  async criar(fila: FilaCreateDTO): Promise<ApiResponse<FilaResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/filas`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(fila)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar fila: ${response.statusText}`);
    }

    return response.json();
  },

  // Buscar fila por ID
  async buscarPorId(id: string): Promise<ApiResponse<FilaResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/filas/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar fila: ${response.statusText}`);
    }

    return response.json();
  },

  // Listar filas por unidade
  async listarPorUnidade(unidadeId: string): Promise<ApiResponse<FilaResponseDTO[]>> {
    const response = await fetch(`${API_BASE_URL}/api/filas/unidade/${unidadeId}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar filas: ${response.statusText}`);
    }

    return response.json();
  },

  // Atualizar fila parcialmente
  async atualizarParcialmente(id: string, fila: FilaUpdateDTO): Promise<ApiResponse<FilaResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/filas/${id}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(fila)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar fila: ${response.statusText}`);
    }

    return response.json();
  },

  // Desativar fila
  async desativar(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/filas/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao desativar fila: ${response.statusText}`);
    }

    return response.json();
  }
};
