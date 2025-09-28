import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Clock,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    UserCheck,
    Timer,
    Building2,
    Loader2,
    RefreshCw,
    BarChart3,
    PieChart,
    Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { filaService } from '@/services/filaService';
import { unidadeService } from '@/services/unidadeService';
import {
    FilaResponseDTO,
    UnidadeAtendimentoResponseDTO
} from '@/types';

interface MetricasFila {
    fila: FilaResponseDTO;
    aguardando: number;
    prioritarios: number;
    tempoMedioEspera: number;
}

interface EstatisticasGerais {
    totalFilas: number;
    totalAguardando: number;
    totalPrioritarios: number;
    tempoMedioGeral: number;
    atendimentosHoje: number;
}

const Dashboard = () => {
    const [unidadeAtual, setUnidadeAtual] = useState<UnidadeAtendimentoResponseDTO | null>(null);
    const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
    const [metricasFilas, setMetricasFilas] = useState<MetricasFila[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { toast } = useToast();
    const { user, selectedUnitId, isAdmin } = useAuth();

    useEffect(() => {
        loadDashboardData();
        // Atualizar dados a cada 60 segundos
        const interval = setInterval(loadDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            console.log('🔄 Carregando dados do dashboard...');

            // Tentar carregar unidades primeiro
            let unidadeData: UnidadeAtendimentoResponseDTO | null = null;
            let filasData: FilaResponseDTO[] = [];

            try {
                // Carregar todas as unidades se não há uma específica selecionada
                const unidadesResponse = await unidadeService.listarTodas();
                const unidades = unidadesResponse.data || [];

                if (unidades.length > 0) {
                    unidadeData = unidades[0]; // Usar a primeira unidade como padrão
                    setUnidadeAtual(unidadeData);
                    console.log('✅ Unidade carregada:', unidadeData.nome);

                    // Tentar carregar filas para esta unidade
                    try {
                        const filasResponse = await filaService.listarPorUnidade(unidadeData.id);
                        filasData = filasResponse.data || [];
                        console.log('✅ Filas carregadas:', filasData.length);
                    } catch (filaError) {
                        console.warn('⚠️ Não foi possível carregar filas:', filaError);
                        filasData = [];
                    }
                } else {
                    console.warn('⚠️ Nenhuma unidade encontrada');
                }
            } catch (unidadeError) {
                console.warn('⚠️ Não foi possível carregar unidades:', unidadeError);
            }

            // Criar métricas simuladas para as filas (já que não temos entrada-fila funcionando ainda)
            const metricas: MetricasFila[] = filasData.map(fila => ({
                fila,
                aguardando: Math.floor(Math.random() * 10), // Dados simulados
                prioritarios: Math.floor(Math.random() * 3),
                tempoMedioEspera: Math.floor(Math.random() * 30)
            }));

            setMetricasFilas(metricas);

            // Calcular estatísticas gerais
            const totalAguardando = metricas.reduce((sum, m) => sum + m.aguardando, 0);
            const totalPrioritarios = metricas.reduce((sum, m) => sum + m.prioritarios, 0);
            const tempoMedioGeral = metricas.length > 0 
                ? metricas.reduce((sum, m) => sum + m.tempoMedioEspera, 0) / metricas.length 
                : 0;

            setEstatisticas({
                totalFilas: filasData.length,
                totalAguardando,
                totalPrioritarios,
                tempoMedioGeral,
                atendimentosHoje: Math.floor(Math.random() * 50) // Dados simulados
            });

            console.log('✅ Dashboard atualizado com sucesso');
        } catch (error: any) {
            console.error('❌ Erro ao carregar dashboard:', error);

            // Definir valores padrão em caso de erro
            setEstatisticas({
                totalFilas: 0,
                totalAguardando: 0,
                totalPrioritarios: 0,
                tempoMedioGeral: 0,
                atendimentosHoje: 0
            });
            setMetricasFilas([]);

            toast({
                title: 'Aviso',
                description: 'Alguns dados podem não estar disponíveis. Configure filas para ver mais informações.',
                variant: 'default',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadDashboardData(true);
    };

    const getStatusColor = (aguardando: number): string => {
        if (aguardando === 0) return 'text-green-600';
        if (aguardando <= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (tempo: number): string => {
        if (tempo <= 10) return 'bg-green-500';
        if (tempo <= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatTempo = (minutos: number): string => {
        if (minutos < 60) {
            return `${Math.round(minutos)}m`;
        }
        const horas = Math.floor(minutos / 60);
        const mins = Math.round(minutos % 60);
        return `${horas}h ${mins}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Visão geral das operações{unidadeAtual ? ` - ${unidadeAtual.nome}` : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleRefresh} 
                        variant="outline" 
                        size="sm"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Cards de Estatísticas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Aguardando</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getStatusColor(estatisticas?.totalAguardando || 0)}`}>
                            {estatisticas?.totalAguardando || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Em todas as filas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prioritários</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {estatisticas?.totalPrioritarios || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Atendimento prioritário
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatTempo(estatisticas?.tempoMedioGeral || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tempo de espera
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Filas Ativas</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {estatisticas?.totalFilas || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Filas configuradas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Status das Filas em Tempo Real */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Status das Filas em Tempo Real
                    </CardTitle>
                    <CardDescription>
                        Monitoramento das filas de atendimento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {metricasFilas.length > 0 ? (
                        <div className="space-y-4">
                            {metricasFilas.map((metrica) => (
                                <div key={metrica.fila.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <h4 className="font-medium">{metrica.fila.nome}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {metrica.fila.setor.nome}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getStatusColor(metrica.aguardando)}`}>
                                                {metrica.aguardando}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Aguardando</p>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-lg font-bold text-orange-600">
                                                {metrica.prioritarios}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Prioritários</p>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-lg font-bold">
                                                {formatTempo(metrica.tempoMedioEspera)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Tempo Médio</p>
                                        </div>

                                        <div className="w-24">
                                            <Progress
                                                value={Math.min((metrica.tempoMedioEspera / 60) * 100, 100)}
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Nenhuma fila configurada</h3>
                            <p className="text-muted-foreground mb-4">
                                Configure filas para começar o atendimento
                            </p>
                            <Button onClick={() => window.location.href = '/gestao'}>
                                <Building2 className="h-4 w-4 mr-2" />
                                Ir para Gestão
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Ações Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Button
                            variant="outline"
                            className="h-20 flex-col gap-2"
                            onClick={() => window.location.href = '/entrada-fila'}
                        >
                            <UserCheck className="h-6 w-6" />
                            Entrada em Fila
                        </Button>

                        <Button
                            variant="outline"
                            className="h-20 flex-col gap-2"
                            onClick={() => window.location.href = '/painel-profissional'}
                        >
                            <Timer className="h-6 w-6" />
                            Painel Profissional
                        </Button>

                        <Button
                            variant="outline"
                            className="h-20 flex-col gap-2"
                            onClick={() => window.location.href = '/gestao'}
                        >
                            <Building2 className="h-6 w-6" />
                            Gestão
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Informações da Sessão */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Informações da Sessão
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium mb-1">Usuário Ativo</p>
                            <p className="text-muted-foreground">{user?.nomeUsuario || 'Não identificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Perfil</p>
                            <Badge variant={isAdmin ? 'default' : 'secondary'}>
                                {isAdmin ? 'Administrador' : 'Usuário'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;

