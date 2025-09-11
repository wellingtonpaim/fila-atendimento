import { ApiResponse, LoginRequest, UsuarioCreateDTO, UsuarioResponseDTO } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class AuthService {
    private readonly TOKEN_KEY = 'qmanager_token';
    private readonly USER_KEY = 'qmanager_user';
    private readonly UNIT_KEY = 'qmanager_selected_unit';

    /**
     * Realiza login do usuário
     */
    async login(credentials: LoginRequest): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: credentials.username,
                    password: credentials.password,
                    unidadeAtendimentoId: credentials.unidadeAtendimentoId
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro na autenticação');
            }

            const result: ApiResponse<string> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro na autenticação');
            }

            // Salvar token
            const token = result.data;
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.UNIT_KEY, credentials.unidadeAtendimentoId);

            // Buscar dados do usuário após login
            await this.fetchUserData();

            return token;
        } catch (error: any) {
            console.error('❌ Erro no login:', error);
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    /**
     * Registra novo usuário
     */
    async register(userData: UsuarioCreateDTO): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro no registro');
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro no registro');
            }
        } catch (error: any) {
            console.error('❌ Erro no registro:', error);
            throw new Error(error.message || 'Erro ao registrar usuário');
        }
    }

    /**
     * Confirma email do usuário
     */
    async confirmEmail(token: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/confirmar?token=${encodeURIComponent(token)}`, {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro na confirmação');
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro na confirmação');
            }
        } catch (error: any) {
            console.error('❌ Erro na confirmação:', error);
            throw new Error(error.message || 'Erro ao confirmar email');
        }
    }

    /**
     * Busca dados do usuário logado
     */
    private async fetchUserData(): Promise<void> {
        try {
            const token = this.getToken();
            if (!token) return;

            // Decodificar JWT para obter email (simplificado)
            const payload = this.decodeJWT(token);
            const email = payload?.sub || payload?.email;

            if (!email) return;

            const response = await fetch(`${API_BASE_URL}/api/usuarios/email/${encodeURIComponent(email)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result: ApiResponse<UsuarioResponseDTO> = await response.json();
                if (result.success) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(result.data));
                }
            }
        } catch (error) {
            console.error('❌ Erro ao buscar dados do usuário:', error);
        }
    }

    /**
     * Decodifica JWT (simplificado)
     */
    private decodeJWT(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('❌ Erro ao decodificar JWT:', error);
            return null;
        }
    }

    /**
     * Logout do usuário
     */
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.UNIT_KEY);

        // NÃO fazer redirecionamento automático aqui
        // O redirecionamento será feito pelo React Router
    }

    /**
     * Obtém o token atual
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Obtém dados do usuário logado
     */
    getUsuario(): UsuarioResponseDTO | null {
        const userData = localStorage.getItem(this.USER_KEY);
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('❌ Erro ao parsear dados do usuário:', error);
            return null;
        }
    }

    /**
     * Obtém ID da unidade selecionada
     */
    getSelectedUnitId(): string | null {
        return localStorage.getItem(this.UNIT_KEY);
    }

    /**
     * Define unidade selecionada
     */
    setSelectedUnitId(unitId: string): void {
        localStorage.setItem(this.UNIT_KEY, unitId);
    }

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Verificar se token não expirou
        try {
            const payload = this.decodeJWT(token);
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    /**
     * Verifica se usuário é administrador
     */
    isAdmin(): boolean {
        const user = this.getUsuario();
        return user?.categoria === 'ADMINISTRADOR';
    }

    /**
     * Obtém headers de autorização
     */
    getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        const unitId = this.getSelectedUnitId();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (unitId) {
            headers['X-Unidade-Id'] = unitId;
        }

        return headers;
    }

    /**
     * Exclui usuário por email (admin only)
     */
    async deleteUserByEmail(email: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/delete/${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao excluir usuário');
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao excluir usuário');
            }
        } catch (error: any) {
            console.error('❌ Erro ao excluir usuário:', error);
            throw new Error(error.message || 'Erro ao excluir usuário');
        }
    }
}

export const authService = new AuthService();
