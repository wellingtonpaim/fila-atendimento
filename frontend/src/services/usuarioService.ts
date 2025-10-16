import { ApiResponse, UsuarioCreateDTO, UsuarioResponseDTO, UsuarioUpdateDTO } from '@/types';
import { authService } from './authService';
import { parsePaginationMeta, PaginationMeta } from '@/lib/pagination';
import BackendConfig from '@/config/BackendConfig';

const API_BASE_URL = BackendConfig.apiBaseUrl;

export const usuarioService = {
  // Criar um novo usuário
  async criar(usuario: UsuarioCreateDTO): Promise<ApiResponse<UsuarioResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(usuario)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar usuário: ${response.statusText}`);
    }

    return response.json();
  },

  // Listar todos os usuários
  async listarTodos(): Promise<ApiResponse<UsuarioResponseDTO[]>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar usuários: ${response.statusText}`);
    }

    return response.json();
  },

  // Listar usuários com paginação
  async listarTodosPaginado(page: number, size: number): Promise<{ data: UsuarioResponseDTO[]; meta: PaginationMeta | null; }> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios?page=${page}&size=${size}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Erro ao listar usuários: ${response.statusText}`);
    const body: ApiResponse<UsuarioResponseDTO[]> = await response.json();
    const meta = parsePaginationMeta(response, page, size, body?.data?.length ?? 0);
    return { data: body?.data || [], meta };
  },

  // Buscar usuário por ID
  async buscarPorId(id: string): Promise<ApiResponse<UsuarioResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
    }

    return response.json();
  },

  // Buscar usuário por email
  async buscarPorEmail(email: string): Promise<ApiResponse<UsuarioResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário por email: ${response.statusText}`);
    }

    return response.json();
  },

  // Substituir usuário completamente
  async substituir(id: string, usuario: UsuarioCreateDTO): Promise<ApiResponse<UsuarioResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(usuario)
    });

    if (!response.ok) {
      throw new Error(`Erro ao substituir usuário: ${response.statusText}`);
    }

    return response.json();
  },

  // Atualizar usuário parcialmente
  async atualizarParcialmente(id: string, usuario: UsuarioUpdateDTO): Promise<ApiResponse<UsuarioResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(usuario)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar usuário: ${response.statusText}`);
    }

    return response.json();
  },

  // Promover usuário para administrador
  async promoverParaAdministrador(id: string): Promise<ApiResponse<UsuarioResponseDTO>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}/promover`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao promover usuário: ${response.statusText}`);
    }

    return response.json();
  },

  // Desativar usuário
  async desativar(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao desativar usuário: ${response.statusText}`);
    }

    return response.json();
  }
};
