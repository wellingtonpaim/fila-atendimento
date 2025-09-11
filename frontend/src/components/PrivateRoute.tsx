import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
    children, 
    adminOnly = false 
}) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Redirecionar para login se não autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar permissão de admin se necessário
    if (adminOnly && !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4 max-w-md mx-auto p-6">
                    <div className="text-6xl">🚫</div>
                    <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
                    <p className="text-muted-foreground">
                        Você não tem permissão para acessar esta página. 
                        É necessário ter privilégios de administrador.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
