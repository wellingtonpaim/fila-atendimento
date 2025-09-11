import { 
    ApiResponse, 
    SetorResponseDTO, 
    SetorCreateDTO, 
    SetorUpdateDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class SetorService {
    private static instance: SetorService;

    private constructor() {}

    public static getInstance(): SetorService {
        if (!SetorService.instance) {
            SetorService.instance = new SetorService();
        }
        return SetorService.instance;
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
     * Busca todos os setores
     */
    async listarTodos(): Promise<SetorResponseDTO[]> {
        try {
            console.log('🚀 Buscando todos os setores...');

            const response = await fetch(`${API_BASE_URL}/api/setores`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<SetorResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar setores');
            }

            console.log('✅ Setores carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar setores:', error);
            throw error;
        }
    }

    /**
     * Busca setor por ID
     */
    async buscarPorId(id: string): Promise<SetorResponseDTO> {
        try {
            console.log('🚀 Buscando setor por ID:', id);

            const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<SetorResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar setor');
            }

            console.log('✅ Setor encontrado:', result.data.nome);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar setor:', error);
            throw error;
        }
    }

    /**
     * Busca setores por nome
     */
    async buscarPorNome(nome: string): Promise<SetorResponseDTO[]> {
        try {
            console.log('🚀 Buscando setores por nome:', nome);

            const response = await fetch(`${API_BASE_URL}/api/setores/nome/${encodeURIComponent(nome)}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<SetorResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar setores por nome');
            }

            console.log('✅ Setores encontrados por nome:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar setores por nome:', error);
            throw error;
        }
    }

    /**
     * Cria novo setor
     */
    async criar(setor: SetorCreateDTO): Promise<SetorResponseDTO> {
        try {
            console.log('🚀 Criando novo setor:', setor.nome);

            const response = await fetch(`${API_BASE_URL}/api/setores`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(setor),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<SetorResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao criar setor');
            }

            console.log('✅ Setor criado:', result.data.nome);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao criar setor:', error);
            throw error;
        }
    }

    /**
     * Atualiza setor completo (PUT)
     */
    async atualizar(id: string, setor: SetorCreateDTO): Promise<SetorResponseDTO> {
        try {
            console.log('🚀 Atualizando setor:', id);

            const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(setor),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<SetorResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar setor');
            }

            console.log('✅ Setor atualizado:', result.data.nome);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar setor:', error);
            throw error;
        }
    }

    /**
     * Atualiza setor parcialmente (PATCH)
     */
    async atualizarParcialmente(id: string, setor: SetorUpdateDTO): Promise<SetorResponseDTO> {
        try {
            console.log('🚀 Atualizando parcialmente setor:', id);

            const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(setor),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<SetorResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar setor');
            }

            console.log('✅ Setor atualizado parcialmente:', result.data.nome);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar parcialmente setor:', error);
            throw error;
        }
    }

    /**
     * Desativa setor
     */
    async desativar(id: string): Promise<void> {
        try {
            console.log('🚀 Desativando setor:', id);

            const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao desativar setor');
            }

            console.log('✅ Setor desativado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao desativar setor:', error);
            throw error;
        }
    }
}

// Exportar instância singleton
export const setorService = SetorService.getInstance();
