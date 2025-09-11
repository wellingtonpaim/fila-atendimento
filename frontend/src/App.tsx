import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PainelProfissional from "./pages/PainelProfissional";
import EntradaFila from "./pages/EntradaFila";
import Gestao from "./pages/Gestao";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

// Layouts e Componentes
import DashboardLayout from "./components/Layout/DashboardLayout";
import PainelPublico from "./components/PainelPublico/PainelPublico";

const queryClient = new QueryClient();

const App = () => {
    console.log('🚀 Q-Manager App iniciando...');

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AuthProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <Routes>
                            {/* Rotas públicas */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/painel-publico" element={<PainelPublico />} />

                            {/* Rotas protegidas */}
                            <Route path="/" element={
                                <PrivateRoute>
                                    <DashboardLayout />
                                </PrivateRoute>
                            }>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="painel-profissional" element={<PainelProfissional />} />
                                <Route path="entrada-fila" element={<EntradaFila />} />
                                <Route path="gestao" element={
                                    <PrivateRoute adminOnly>
                                        <Gestao />
                                    </PrivateRoute>
                                } />
                                <Route path="configuracoes" element={
                                    <PrivateRoute adminOnly>
                                        <Configuracoes />
                                    </PrivateRoute>
                                } />
                            </Route>

                            {/* Rota 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
