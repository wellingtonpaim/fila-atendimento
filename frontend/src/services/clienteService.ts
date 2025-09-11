import { 
    ApiResponse, 
    ClienteResponseDTO, 
    ClienteCreateDTO, 
    ClienteUpdateDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class ClienteService {
    /**
     * Lista todos os clientes
     */
    async listarTodos(): Promise<ClienteResponseDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar clientes');
            }

            const result: ApiResponse<ClienteResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar clientes');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar clientes:', error);
            throw new Error(error.message || 'Erro ao buscar clientes');
        }
    }

    /**
     * Busca cliente por ID
     */
    async buscarPorId(id: string): Promise<ClienteResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar cliente');
            }

            const result: ApiResponse<ClienteResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar cliente');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao buscar cliente por ID:', error);
            throw new Error(error.message || 'Erro ao buscar cliente');
        }
    }

    /**
     * Busca cliente por CPF
     */
    async buscarPorCpf(cpf: string): Promise<ClienteResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/cpf/${encodeURIComponent(cpf)}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar cliente por CPF');
            }

            const result: ApiResponse<ClienteResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar cliente por CPF');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao buscar cliente por CPF:', error);
            throw new Error(error.message || 'Erro ao buscar cliente por CPF');
        }
    }

    /**
     * Busca clientes por nome
     */
    async buscarPorNome(nome: string): Promise<ClienteResponseDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/nome/${encodeURIComponent(nome)}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar clientes por nome');
            }

            const result: ApiResponse<ClienteResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar clientes por nome');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao buscar clientes por nome:', error);
            throw new Error(error.message || 'Erro ao buscar clientes por nome');
        }
    }

    /**
     * Cria novo cliente
     */
    async criar(cliente: ClienteCreateDTO): Promise<ClienteResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes`, {
                method: 'POST',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(cliente)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao criar cliente');
            }

            const result: ApiResponse<ClienteResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao criar cliente');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao criar cliente:', error);
            throw new Error(error.message || 'Erro ao criar cliente');
        }
    }

    /**
     * Atualiza cliente completo
     */
    async atualizar(id: string, cliente: ClienteCreateDTO): Promise<ClienteResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
                method: 'PUT',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(cliente)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao atualizar cliente');
            }

            const result: ApiResponse<ClienteResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar cliente');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao atualizar cliente:', error);
            throw new Error(error.message || 'Erro ao atualizar cliente');
        }
    }

    /**
     * Atualiza cliente parcialmente
     */
    async atualizarParcialmente(id: string, cliente: ClienteUpdateDTO): Promise<ClienteResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
                method: 'PATCH',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(cliente)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao atualizar cliente');
            }

            const result: ApiResponse<ClienteResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar cliente');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao atualizar cliente parcialmente:', error);
            throw new Error(error.message || 'Erro ao atualizar cliente');
        }
    }

    /**
     * Desativa cliente
     */
    async desativar(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
                method: 'DELETE',
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao desativar cliente');
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao desativar cliente');
            }
        } catch (error: any) {
            console.error('❌ Erro ao desativar cliente:', error);
            throw new Error(error.message || 'Erro ao desativar cliente');
        }
    }
}

export const clienteService = new ClienteService();
