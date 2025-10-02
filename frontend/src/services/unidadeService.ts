import { ApiResponse, UnidadeAtendimentoCreateDTO, UnidadeAtendimentoResponseDTO, UnidadeAtendimentoUpdateDTO, UnidadeAtendimentoPublicDTO } from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://192.168.0.100:8899'; // Altere para o IP real do backend

export const unidadeService = {
  // Listar unidades públicas para tela de login (endpoint sem autenticação)
  async listarParaLogin(): Promise<UnidadeAtendimentoPublicDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/public/login`, {
      method: 'GET'
      // Não enviar Content-Type em GET para evitar preflight CORS desnecessário
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar unidades para login: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<UnidadeAtendimentoPublicDTO[]> = await response.json();

    if (result?.success === false) {
      throw new Error(result.message || 'Falha ao carregar unidades para login');
    }

    return result.data || [];
  },

  // Criar uma nova unidade de atendimento
  async criar(unidade: UnidadeAtendimentoCreateDTO): Promise<ApiResponse<UnidadeAtendimentoResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(unidade)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar unidade: ${response.statusText}`);
    }

    return response.json();
  },

  // Listar todas as unidades
  async listarTodas(): Promise<ApiResponse<UnidadeAtendimentoResponseDTO[]>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar unidades: ${response.statusText}`);
    }

    return response.json();
  },

  // Buscar unidade por ID
  async buscarPorId(id: string): Promise<ApiResponse<UnidadeAtendimentoResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar unidade: ${response.statusText}`);
    }

    return response.json();
  },

  // Buscar unidades por nome
  async buscarPorNome(nome: string): Promise<ApiResponse<UnidadeAtendimentoResponseDTO[]>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/nome/${encodeURIComponent(nome)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar unidades por nome: ${response.statusText}`);
    }

    return response.json();
  },

  // Substituir unidade completamente
  async substituir(id: string, unidade: UnidadeAtendimentoCreateDTO): Promise<ApiResponse<UnidadeAtendimentoResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(unidade)
    });

    if (!response.ok) {
      throw new Error(`Erro ao substituir unidade: ${response.statusText}`);
    }

    return response.json();
  },

  // Atualizar unidade parcialmente
  async atualizarParcialmente(id: string, unidade: UnidadeAtendimentoUpdateDTO): Promise<ApiResponse<UnidadeAtendimentoResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(unidade)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar unidade: ${response.statusText}`);
    }

    return response.json();
  },

  // Desativar unidade
  async desativar(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao desativar unidade: ${response.statusText}`);
    }

    return response.json();
  }
};
