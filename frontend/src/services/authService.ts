import { ApiResponse, LoginRequest, Usuario } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

// Log para debug das variáveis de ambiente
console.log('🔍 AuthService - Variáveis de ambiente:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('API_BASE_URL final:', API_BASE_URL);

class AuthService {
    private static instance: AuthService;
    private token: string | null = null;
    private usuario: Usuario | null = null;

    private constructor() {
        try {
            // Recuperar token do localStorage na inicialização
            this.token = localStorage.getItem('qmanager_token');
            const usuarioData = localStorage.getItem('qmanager_usuario');
            if (usuarioData) {
                this.usuario = JSON.parse(usuarioData);
            }
            console.log('✅ AuthService inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar AuthService:', error);
        }
    }

    public static getInstance(): AuthService {
        try {
            if (!AuthService.instance) {
                AuthService.instance = new AuthService();
            }
            return AuthService.instance;
        } catch (error) {
            console.error('❌ Erro ao obter instância AuthService:', error);
            throw error;
        }
    }

    async login(loginData: LoginRequest): Promise<string> {
        try {
            console.log('🚀 AuthService.login iniciado');

            // Criar URLSearchParams para enviar como form data (requestParams)
            const formData = new URLSearchParams();
            formData.append('username', loginData.email);
            formData.append('password', loginData.senha);
            formData.append('unidadeAtendimentoId', loginData.unidadeId);

            console.log('📤 Enviando dados de login:', {
                username: loginData.email,
                unidadeId: loginData.unidadeId
            });

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            console.log('📡 Resposta do servidor:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`Erro na autenticação: ${response.statusText}`);
            }

            const result: ApiResponse<string> = await response.json();
            console.log('📦 Dados recebidos:', result);

            if (!result.success) {
                throw new Error(result.message);
            }

            // O backend retorna apenas o token no campo data
            this.token = result.data;

            // Por enquanto, vamos criar um usuário mock até termos endpoint para buscar dados do usuário
            this.usuario = {
                id: 1,
                nome: loginData.email.split('@')[0], // Usar parte do email como nome temporário
                email: loginData.email,
                categoria: 'USUARIO',
                ativo: true,
                unidadesAtendimento: []
            };

            localStorage.setItem('qmanager_token', this.token);
            localStorage.setItem('qmanager_usuario', JSON.stringify(this.usuario));

            console.log('✅ Login realizado com sucesso, token armazenado');

            return this.token;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw new Error(`Falha no login: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    logout(): void {
        try {
            this.token = null;
            this.usuario = null;
            localStorage.removeItem('qmanager_token');
            localStorage.removeItem('qmanager_usuario');
            console.log('✅ Logout realizado');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
        }
    }

    isAuthenticated(): boolean {
        try {
            const isAuth = !!this.token;
            console.log('🔐 Verificação de autenticação:', isAuth);
            return isAuth;
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            return false;
        }
    }

    getToken(): string | null {
        return this.token;
    }

    getUsuario(): Usuario | null {
        return this.usuario;
    }

    getAuthHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    async makeAuthenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response.json();
    }
}

// Exportar a instância de forma segura
let authServiceInstance: AuthService;
try {
    authServiceInstance = AuthService.getInstance();
    console.log('✅ AuthService exportado com sucesso');
} catch (error) {
    console.error('❌ Erro ao exportar AuthService:', error);
    // Criar um mock em caso de erro
    authServiceInstance = {
        login: async () => { throw new Error('AuthService não disponível'); },
        logout: () => {},
        isAuthenticated: () => false,
        getToken: () => null,
        getUsuario: () => null,
        getAuthHeaders: () => ({}),
        makeAuthenticatedRequest: async () => { throw new Error('AuthService não disponível'); }
    } as any;
}

export const authService = authServiceInstance;
