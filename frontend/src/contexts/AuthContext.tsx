import React, { createContext, useContext, useEffect, useState } from 'react';
import { UsuarioResponseDTO, LoginRequest, UsuarioCreateDTO } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
    // Estado
    user: UsuarioResponseDTO | null;
    selectedUnitId: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;

    // Ações
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: UsuarioCreateDTO) => Promise<void>;
    logout: () => void;
    setSelectedUnit: (unitId: string) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UsuarioResponseDTO | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Inicialização - verificar se usuário já está logado
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const currentUser = authService.getUsuario();
                const currentUnitId = authService.getSelectedUnitId();
                
                if (currentUser && authService.isAuthenticated()) {
                    setUser(currentUser);
                    setSelectedUnitId(currentUnitId);
                } else {
                    // Apenas limpar dados locais, sem chamar logout()
                    setUser(null);
                    setSelectedUnitId(null);
                }
            } catch (error) {
                console.error('❌ Erro ao inicializar autenticação:', error);
                setUser(null);
                setSelectedUnitId(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Função de login
    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setLoading(true);
            await authService.login(credentials);
            
            // Atualizar estado
            const userData = authService.getUsuario();
            const unitId = authService.getSelectedUnitId();
            
            setUser(userData);
            setSelectedUnitId(unitId);
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Função de registro
    const register = async (userData: UsuarioCreateDTO): Promise<void> => {
        try {
            setLoading(true);
            await authService.register(userData);
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Função de logout
    const logout = (): void => {
        setUser(null);
        setSelectedUnitId(null);
        authService.logout();
    };

    // Função para alterar unidade selecionada
    const setSelectedUnit = (unitId: string): void => {
        setSelectedUnitId(unitId);
        authService.setSelectedUnitId(unitId);
    };

    // Função para atualizar dados do usuário
    const refreshUser = async (): Promise<void> => {
        try {
            if (!authService.isAuthenticated()) {
                logout();
                return;
            }

            // Forçar recarregamento dos dados do usuário
            const token = authService.getToken();
            if (token) {
                // Re-fetch user data (implementar se necessário)
                const currentUser = authService.getUsuario();
                setUser(currentUser);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            logout();
        }
    };

    // Estados computados
    const isAuthenticated = authService.isAuthenticated() && !!user;
    const isAdmin = authService.isAdmin();

    const value: AuthContextType = {
        // Estado
        user,
        selectedUnitId,
        isAuthenticated,
        isAdmin,
        loading,

        // Ações
        login,
        register,
        logout,
        setSelectedUnit,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
