import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/Layout/DashboardLayout";
import PainelPublico from "./components/PainelPublico/PainelPublico";
import { authService } from "./services/authService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    try {
        return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
    } catch (error) {
        console.error('Erro no ProtectedRoute:', error);
        return <Navigate to="/login" replace />;
    }
};

const App = () => {
    console.log('🚀 App iniciando...');

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/painel-publico" element={<PainelPublico />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
