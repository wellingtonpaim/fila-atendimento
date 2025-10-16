import { ApiResponse, SetorCreateDTO, SetorResponseDTO, SetorUpdateDTO } from '@/types';
import { authService } from './authService';
import { parsePaginationMeta, PaginationMeta } from '@/lib/pagination';
import BackendConfig from '@/config/BackendConfig';

const API_BASE_URL = BackendConfig.apiBaseUrl;

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

  // Listar todos os setores com paginação
  async listarTodosPaginado(page: number, size: number): Promise<{ data: SetorResponseDTO[]; meta: PaginationMeta | null; }> {
    const response = await fetch(`${API_BASE_URL}/api/setores?page=${page}&size=${size}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Erro ao listar setores: ${response.statusText}`);
    const body: ApiResponse<SetorResponseDTO[]> = await response.json();
    const meta = parsePaginationMeta(response, page, size, body?.data?.length ?? 0);
    return { data: body?.data || [], meta };
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

  // Buscar setores por nome com paginação
  async buscarPorNomePaginado(nome: string, page: number, size: number): Promise<{ data: SetorResponseDTO[]; meta: PaginationMeta | null; }> {
    const response = await fetch(`${API_BASE_URL}/api/setores/nome/${encodeURIComponent(nome)}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Erro ao buscar setores por nome: ${response.statusText}`);
    const body: ApiResponse<SetorResponseDTO[]> = await response.json();
    const meta = parsePaginationMeta(response, page, size, body?.data?.length ?? 0);
    return { data: body?.data || [], meta };
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
