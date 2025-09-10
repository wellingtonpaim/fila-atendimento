import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Clock,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    UserCheck,
    Timer
} from 'lucide-react';
import { authService } from '@/services/authService';
import { DashboardMetricas } from '@/types';

const Dashboard = () => {
    const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Mock data por enquanto - substituir pela chamada real da API
            const mockMetricas: DashboardMetricas = {
                totalClientes: 45,
                clientesAguardando: 12,
                clientesAtendimento: 8,
                tempoMedioEspera: 15,
                tempoMedioAtendimento: 25,
                filasAtivas: 6
            };

            setMetricas(mockMetricas);
        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
        } finally {
            setLoading(false);
        }
    };

    const usuario = authService.getUsuario();
    const unidade = usuario?.unidadesAtendimento[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1
                    className="text-3xl font-bold text-primary"
                    tabIndex={0}
                >
                    Dashboard
                </h1>
                <p
                    className="text-muted-foreground text-lg"
                    tabIndex={0}
                >
                    Visão geral do atendimento em {unidade?.nome || 'sua unidade'}
                </p>
            </div>

            {/* Métricas Principais */}
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                role="region"
                aria-label="Métricas principais do sistema"
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-primary"
                            aria-label={`${metricas?.totalClientes} clientes no total`}
                        >
                            {metricas?.totalClientes}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Clientes atendidos hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
                        <Clock className="h-4 w-4 text-warning" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-warning"
                            aria-label={`${metricas?.clientesAguardando} clientes aguardando atendimento`}
                        >
                            {metricas?.clientesAguardando}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Na fila de espera
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
                        <UserCheck className="h-4 w-4 text-success" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-success"
                            aria-label={`${metricas?.clientesAtendimento} clientes sendo atendidos`}
                        >
                            {metricas?.clientesAtendimento}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sendo atendidos agora
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold"
                            aria-label={`${metricas?.tempoMedioEspera} minutos de tempo médio de espera`}
                        >
                            {metricas?.tempoMedioEspera}min
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tempo de espera
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
                            Painel do Profissional
                        </CardTitle>
                        <CardDescription>
                            Gerencie suas filas e chame os próximos pacientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="medical"
                            aria-label="Ir para o painel do profissional para gerenciar filas"
                        >
                            Acessar Painel
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-secondary" aria-hidden="true" />
                            Gestão de Clientes
                        </CardTitle>
                        <CardDescription>
                            Cadastre novos clientes e gerencie informações
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="secondary"
                            aria-label="Ir para gestão de clientes para cadastrar e gerenciar"
                        >
                            Gerenciar Clientes
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-success" aria-hidden="true" />
                            Relatórios
                        </CardTitle>
                        <CardDescription>
                            Visualize relatórios e métricas detalhadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="success"
                            aria-label="Acessar relatórios e métricas do sistema"
                        >
                            Ver Relatórios
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Status do Sistema */}
            <Card>
                <CardHeader>
                    <CardTitle>Status do Sistema</CardTitle>
                    <CardDescription>
                        Monitoramento em tempo real dos serviços
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                            <span className="text-sm">API: Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                            <span className="text-sm">WebSocket: Conectado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                            <span className="text-sm">Base de Dados: Lento</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;