import { ApiResponse, ClienteCreateDTO, ClienteResponseDTO, ClienteUpdateDTO } from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  page: number; // base 0
  pageSize: number;
}

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
  async buscarPorId(id: string): Promise<ClienteResponseDTO> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar cliente: ${res.statusText}`);
    const body: ApiResponse<ClienteResponseDTO> = await res.json();
    return body.data;
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
   * Busca clientes por nome (com paginação) - retorna envelope padrão
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
   * Busca cliente por CPF (retorna item único)
   */
  async buscarPorCpf(cpf: string): Promise<ClienteResponseDTO | null> {
    const res = await fetch(`${API_BASE_URL}/api/clientes/cpf/${encodeURIComponent(cpf)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar cliente por CPF: ${res.statusText}`);
    const body: ApiResponse<ClienteResponseDTO> = await res.json();
    return body?.data || null;
  },

  /**
   * Busca clientes por email (com paginação) - envelope padrão
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
   * Busca clientes por telefone (com paginação) - envelope padrão
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

  // ===== Métodos paginados com metadados =====
  async buscarPorNomePaginado(nome: string, page: number, size: number): Promise<{ data: ClienteResponseDTO[]; meta: PaginationMeta | null; }> {
    const url = `${API_BASE_URL}/api/clientes/nome/${encodeURIComponent(nome)}?page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authService.getAuthHeaders() });
    if (!res.ok) throw new Error(`Erro ao buscar clientes por nome: ${res.statusText}`);
    const body: ApiResponse<ClienteResponseDTO[]> = await res.json();
    const meta = this.parsePaginationMeta(res, page, size, body?.data?.length ?? 0);
    return { data: body?.data || [], meta };
  },

  async buscarPorEmailPaginado(email: string, page: number, size: number): Promise<{ data: ClienteResponseDTO[]; meta: PaginationMeta | null; }> {
    const url = `${API_BASE_URL}/api/clientes/email/${encodeURIComponent(email)}?page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authService.getAuthHeaders() });
    if (!res.ok) throw new Error(`Erro ao buscar clientes por email: ${res.statusText}`);
    const body: ApiResponse<ClienteResponseDTO[]> = await res.json();
    const meta = this.parsePaginationMeta(res, page, size, body?.data?.length ?? 0);
    return { data: body?.data || [], meta };
  },

  async buscarPorTelefonePaginado(telefone: string, page: number, size: number): Promise<{ data: ClienteResponseDTO[]; meta: PaginationMeta | null; }> {
    const url = `${API_BASE_URL}/api/clientes/telefone/${encodeURIComponent(telefone)}?page=${page}&size=${size}`;
    const res = await fetch(url, { headers: authService.getAuthHeaders() });
    if (!res.ok) throw new Error(`Erro ao buscar clientes por telefone: ${res.statusText}`);
    const body: ApiResponse<ClienteResponseDTO[]> = await res.json();
    const meta = this.parsePaginationMeta(res, page, size, body?.data?.length ?? 0);
    return { data: body?.data || [], meta };
  },

  // Util para meta
  parsePaginationMeta(res: Response, page: number, size: number, bodyCount: number): PaginationMeta | null {
    const hTotalCount = res.headers.get('X-Total-Count');
    const hTotalPages = res.headers.get('X-Total-Pages');
    const hPage = res.headers.get('X-Page');
    const hPageSize = res.headers.get('X-Page-Size');

    if (hTotalCount && hTotalPages && hPage && hPageSize) {
      const totalCount = Number(hTotalCount);
      const totalPages = Number(hTotalPages);
      const pageNum = Number(hPage);
      const pageSize = Number(hPageSize);
      if ([totalCount, totalPages, pageNum, pageSize].every(Number.isFinite)) {
        return { totalCount, totalPages, page: pageNum, pageSize };
      }
    }

    const contentRange = res.headers.get('Content-Range');
    if (contentRange) {
      const match = /items\s+(\d+)-(\d+)\/(\d+)/i.exec(contentRange);
      if (match) {
        const totalCount = Number(match[3]);
        const totalPages = Math.max(1, Math.ceil(totalCount / (size || 1)));
        return { totalCount, totalPages, page, pageSize: size };
      }
    }

    // Fallback simples usando o tamanho retornado (pouco preciso)
    if (Number.isFinite(bodyCount)) {
      const totalCount = bodyCount;
      const totalPages = Math.max(1, Math.ceil(totalCount / (size || 1)));
      return { totalCount, totalPages, page, pageSize: size };
    }

    return null;
  }
};
