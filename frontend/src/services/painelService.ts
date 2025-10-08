import {
    ApiResponse,
    PainelResponseDTO,
    PainelCreateDTO,
    PainelUpdateDTO,
    PainelPublicoConfigDTO
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

class PainelService {

    /**
     * Lista painéis por unidade
     */
    async listarPorUnidade(unidadeId: string): Promise<ApiResponse<PainelResponseDTO[]>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/unidade/${unidadeId}`, {
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao buscar painéis por unidade');
        return response.json();
    }

    /**
     * Busca painel por ID
     */
    async buscarPorId(id: string): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${id}`, {
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao buscar painel');
        return response.json();
    }

    /**
     * Busca a configuração pública de um painel (sem autenticação)
     */
    async buscarConfiguracaoPublica(id: string): Promise<ApiResponse<PainelPublicoConfigDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/publico/${id}`);
        if (!response.ok) throw new Error('Falha ao buscar configuração do painel');
        return response.json();
    }

    /**
     * Cria novo painel
     */
    async criar(painel: PainelCreateDTO): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis`, {
            method: 'POST',
            headers: authService.getAuthHeaders(),
            body: JSON.stringify(painel),
        });
        if (!response.ok) throw new Error('Falha ao criar painel');
        return response.json();
    }

    /**
     * Atualiza painel (PUT)
     */
    async atualizar(id: string, painel: PainelUpdateDTO): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${id}`, {
            method: 'PUT',
            headers: authService.getAuthHeaders(),
            body: JSON.stringify(painel),
        });
        if (!response.ok) throw new Error('Falha ao atualizar painel');
        return response.json();
    }

    /**
     * Desativa painel
     */
    async desativar(id: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${id}`, {
            method: 'DELETE',
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao desativar painel');
        return response.json();
    }

    /**
     * Adiciona uma fila a um painel
     */
    async adicionarFila(painelId: string, filaId: string): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${painelId}/filas/${filaId}`, {
            method: 'POST',
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao adicionar fila ao painel');
        return response.json();
    }

    /**
     * Remove uma fila de um painel
     */
    async removerFila(painelId: string, filaId: string): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${painelId}/filas/${filaId}`, {
            method: 'DELETE',
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao remover fila do painel');
        return response.json();
    }
}

// Exportar instância singleton
export const painelService = new PainelService();