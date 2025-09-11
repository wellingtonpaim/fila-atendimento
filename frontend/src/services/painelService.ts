import { 
    ApiResponse, 
    PainelResponseDTO, 
    PainelCreateDTO, 
    PainelUpdateDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class PainelService {
    private static instance: PainelService;

    private constructor() {}

    public static getInstance(): PainelService {
        if (!PainelService.instance) {
            PainelService.instance = new PainelService();
        }
        return PainelService.instance;
    }

    /**
     * Headers padrão para requisições autenticadas
     */
    private getAuthHeaders(): Record<string, string> {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Lista todos os painéis (requer unidadeAtendimentoId como query param)
     */
    async listarTodos(unidadeAtendimentoId: string): Promise<PainelResponseDTO[]> {
        try {
            console.log('🚀 Buscando painéis da unidade:', unidadeAtendimentoId);

            const params = new URLSearchParams({
                unidadeAtendimentoId
            });

            const response = await fetch(`${API_BASE_URL}/painel?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<PainelResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar painéis');
            }

            console.log('✅ Painéis carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar painéis:', error);
            throw error;
        }
    }

    /**
     * Lista painéis por unidade
     */
    async listarPorUnidade(unidadeId: string): Promise<PainelResponseDTO[]> {
        try {
            console.log('🚀 Buscando painéis por unidade:', unidadeId);

            const response = await fetch(`${API_BASE_URL}/painel/unidade/${unidadeId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<PainelResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar painéis por unidade');
            }

            console.log('✅ Painéis por unidade carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar painéis por unidade:', error);
            throw error;
        }
    }

    /**
     * Busca painel por ID
     */
    async buscarPorId(id: string, unidadeAtendimentoId: string): Promise<PainelResponseDTO> {
        try {
            console.log('🚀 Buscando painel por ID:', id);

            const params = new URLSearchParams({
                unidadeAtendimentoId
            });

            const response = await fetch(`${API_BASE_URL}/painel/${id}?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<PainelResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar painel');
            }

            console.log('✅ Painel encontrado:', result.data.descricao);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar painel:', error);
            throw error;
        }
    }

    /**
     * Cria novo painel
     */
    async criar(painel: PainelCreateDTO): Promise<PainelResponseDTO> {
        try {
            console.log('🚀 Criando novo painel:', painel.descricao);

            const response = await fetch(`${API_BASE_URL}/painel`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(painel),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<PainelResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao criar painel');
            }

            console.log('✅ Painel criado:', result.data.descricao);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao criar painel:', error);
            throw error;
        }
    }

    /**
     * Atualiza painel (PUT)
     */
    async atualizar(id: string, painel: PainelUpdateDTO): Promise<PainelResponseDTO> {
        try {
            console.log('🚀 Atualizando painel:', id);

            const response = await fetch(`${API_BASE_URL}/painel/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(painel),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<PainelResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar painel');
            }

            console.log('✅ Painel atualizado:', result.data.descricao);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar painel:', error);
            throw error;
        }
    }

    /**
     * Desativa painel
     */
    async desativar(id: string): Promise<void> {
        try {
            console.log('🚀 Desativando painel:', id);

            const response = await fetch(`${API_BASE_URL}/painel/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao desativar painel');
            }

            console.log('✅ Painel desativado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao desativar painel:', error);
            throw error;
        }
    }
}

// Exportar instância singleton
export const painelService = PainelService.getInstance();
