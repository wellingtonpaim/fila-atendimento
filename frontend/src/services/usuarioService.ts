import { 
    ApiResponse, 
    UsuarioResponseDTO, 
    UsuarioCreateDTO, 
    UsuarioUpdateDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class UsuarioService {
    private static instance: UsuarioService;

    private constructor() {}

    public static getInstance(): UsuarioService {
        if (!UsuarioService.instance) {
            UsuarioService.instance = new UsuarioService();
        }
        return UsuarioService.instance;
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
     * Lista todos os usuários
     */
    async listarTodos(): Promise<UsuarioResponseDTO[]> {
        try {
            console.log('🚀 Buscando todos os usuários...');

            const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar usuários');
            }

            console.log('✅ Usuários carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar usuários:', error);
            throw error;
        }
    }

    /**
     * Busca usuário por ID
     */
    async buscarPorId(id: string): Promise<UsuarioResponseDTO> {
        try {
            console.log('🚀 Buscando usuário por ID:', id);

            const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar usuário');
            }

            console.log('✅ Usuário encontrado:', result.data.nomeUsuario);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error);
            throw error;
        }
    }

    /**
     * Busca usuário por email
     */
    async buscarPorEmail(email: string): Promise<UsuarioResponseDTO> {
        try {
            console.log('🚀 Buscando usuário por email:', email);

            const response = await fetch(`${API_BASE_URL}/api/usuarios/email/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar usuário por email');
            }

            console.log('✅ Usuário encontrado por email:', result.data.nomeUsuario);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    /**
     * Cria novo usuário
     */
    async criar(usuario: UsuarioCreateDTO): Promise<UsuarioResponseDTO> {
        try {
            console.log('🚀 Criando novo usuário:', usuario.nomeUsuario);

            const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(usuario),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao criar usuário');
            }

            console.log('✅ Usuário criado:', result.data.nomeUsuario);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            throw error;
        }
    }

    /**
     * Atualiza usuário completo (PUT)
     */
    async atualizar(id: string, usuario: UsuarioCreateDTO): Promise<UsuarioResponseDTO> {
        try {
            console.log('🚀 Atualizando usuário:', id);

            const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(usuario),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar usuário');
            }

            console.log('✅ Usuário atualizado:', result.data.nomeUsuario);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    /**
     * Atualiza usuário parcialmente (PATCH)
     */
    async atualizarParcialmente(id: string, usuario: UsuarioUpdateDTO): Promise<UsuarioResponseDTO> {
        try {
            console.log('🚀 Atualizando parcialmente usuário:', id);

            const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(usuario),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao atualizar usuário');
            }

            console.log('✅ Usuário atualizado parcialmente:', result.data.nomeUsuario);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar parcialmente usuário:', error);
            throw error;
        }
    }

    /**
     * Promove usuário para administrador
     */
    async promoverParaAdministrador(id: string): Promise<UsuarioResponseDTO> {
        try {
            console.log('🚀 Promovendo usuário para administrador:', id);

            const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}/promover`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<UsuarioResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao promover usuário');
            }

            console.log('✅ Usuário promovido para administrador:', result.data.nomeUsuario);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao promover usuário:', error);
            throw error;
        }
    }

    /**
     * Desativa usuário
     */
    async desativar(id: string): Promise<void> {
        try {
            console.log('🚀 Desativando usuário:', id);

            const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao desativar usuário');
            }

            console.log('✅ Usuário desativado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao desativar usuário:', error);
            throw error;
        }
    }
}

// Exportar instância singleton
export const usuarioService = UsuarioService.getInstance();
