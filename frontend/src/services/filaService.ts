import { 
    ApiResponse, 
    FilaResponseDTO, 
    FilaCreateDTO, 
    FilaUpdateDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class FilaService {
    /**
     * Lista filas por unidade
     */
    async listarPorUnidade(unidadeId: string): Promise<FilaResponseDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/filas/unidade/${unidadeId}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar filas');
            }

            const result: ApiResponse<FilaResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar filas');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar filas por unidade:', error);
            throw new Error(error.message || 'Erro ao buscar filas');
        }
    }

    /**
     * Busca fila por ID
     */
    async buscarPorId(id: string): Promise<FilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/filas/${id}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar fila');
            }

            const result: ApiResponse<FilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar fila');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao buscar fila por ID:', error);
            throw new Error(error.message || 'Erro ao buscar fila');
        }
    }

    /**
     * Cria nova fila
     */
    async criar(fila: FilaCreateDTO): Promise<FilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/filas`, {
                method: 'POST',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(fila)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao criar fila');
            }

            const result: ApiResponse<FilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao criar fila');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao criar fila:', error);
            throw new Error(error.message || 'Erro ao criar fila');
        }
    }

    /**
     * Atualiza fila parcialmente
     */
    async atualizarParcialmente(id: string, fila: FilaUpdateDTO): Promise<FilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/filas/${id}`, {
                method: 'PATCH',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(fila)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao atualizar fila');
            }

            const result: ApiResponse<FilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar fila');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao atualizar fila:', error);
            throw new Error(error.message || 'Erro ao atualizar fila');
        }
    }

    /**
     * Desativa fila
     */
    async desativar(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/filas/${id}`, {
                method: 'DELETE',
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao desativar fila');
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao desativar fila');
            }
        } catch (error: any) {
            console.error('❌ Erro ao desativar fila:', error);
            throw new Error(error.message || 'Erro ao desativar fila');
        }
    }
}

export const filaService = new FilaService();
