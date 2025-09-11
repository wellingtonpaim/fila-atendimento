import {
    ApiResponse,
    UnidadeAtendimentoResponseDTO,
    UnidadeAtendimentoCreateDTO,
    UnidadeAtendimentoUpdateDTO,
    UnidadeAtendimentoPublicDTO
} from "@/types";
import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class UnidadeService {
    /**
     * Lista todas as unidades (protegido)
     */
    async listarTodas(): Promise<UnidadeAtendimentoResponseDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar unidades');
            }

            const result: ApiResponse<UnidadeAtendimentoResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar unidades');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar unidades:', error);
            throw new Error(error.message || 'Erro ao buscar unidades');
        }
    }

    /**
     * Lista unidades para seleção no login (público)
     */
    async listarParaLogin(): Promise<UnidadeAtendimentoPublicDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/public/login`);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar unidades para login');
            }

            const result: ApiResponse<UnidadeAtendimentoPublicDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar unidades para login');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar unidades para login:', error);
            throw new Error(error.message || 'Erro ao buscar unidades para login');
        }
    }

    /**
     * Busca unidade por ID
     */
    async buscarPorId(id: string): Promise<UnidadeAtendimentoResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar unidade');
            }

            const result: ApiResponse<UnidadeAtendimentoResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar unidade');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao buscar unidade por ID:', error);
            throw new Error(error.message || 'Erro ao buscar unidade');
        }
    }

    /**
     * Busca unidades por nome
     */
    async buscarPorNome(nome: string): Promise<UnidadeAtendimentoResponseDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/nome/${encodeURIComponent(nome)}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar unidades por nome');
            }

            const result: ApiResponse<UnidadeAtendimentoResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar unidades por nome');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao buscar unidades por nome:', error);
            throw new Error(error.message || 'Erro ao buscar unidades por nome');
        }
    }

    /**
     * Cria nova unidade
     */
    async criar(unidade: UnidadeAtendimentoCreateDTO): Promise<UnidadeAtendimentoResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento`, {
                method: 'POST',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(unidade)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao criar unidade');
            }

            const result: ApiResponse<UnidadeAtendimentoResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao criar unidade');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao criar unidade:', error);
            throw new Error(error.message || 'Erro ao criar unidade');
        }
    }

    /**
     * Atualiza unidade completa
     */
    async atualizar(id: string, unidade: UnidadeAtendimentoCreateDTO): Promise<UnidadeAtendimentoResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
                method: 'PUT',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(unidade)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao atualizar unidade');
            }

            const result: ApiResponse<UnidadeAtendimentoResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar unidade');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao atualizar unidade:', error);
            throw new Error(error.message || 'Erro ao atualizar unidade');
        }
    }

    /**
     * Atualiza unidade parcialmente
     */
    async atualizarParcialmente(id: string, unidade: UnidadeAtendimentoUpdateDTO): Promise<UnidadeAtendimentoResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
                method: 'PATCH',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(unidade)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao atualizar unidade');
            }

            const result: ApiResponse<UnidadeAtendimentoResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar unidade');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao atualizar unidade parcialmente:', error);
            throw new Error(error.message || 'Erro ao atualizar unidade');
        }
    }

    /**
     * Desativa unidade
     */
    async desativar(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/unidades-atendimento/${id}`, {
                method: 'DELETE',
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao desativar unidade');
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao desativar unidade');
            }
        } catch (error: any) {
            console.error('❌ Erro ao desativar unidade:', error);
            throw new Error(error.message || 'Erro ao desativar unidade');
        }
    }
}

export const unidadeService = new UnidadeService();
