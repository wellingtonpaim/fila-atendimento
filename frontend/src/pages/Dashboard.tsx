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
import { entradaFilaService } from '@/services/entradaFilaService';
import { unidadeService } from '@/services/unidadeService';
import {
    FilaResponseDTO,
    EntradaFilaResponseDTO,
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
        if (selectedUnitId) {
            loadDashboardData();
            // Atualizar dados a cada 60 segundos
            const interval = setInterval(loadDashboardData, 60000);
            return () => clearInterval(interval);
        }
    }, [selectedUnitId]);

    const loadDashboardData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            if (!selectedUnitId) {
                toast({
                    title: 'Erro',
                    description: 'Nenhuma unidade selecionada.',
                    variant: 'destructive',
                });
                return;
            }

            // Carregar dados em paralelo
            const [unidadeData, filasData] = await Promise.all([
                unidadeService.buscarPorId(selectedUnitId),
                filaService.listarPorUnidade(selectedUnitId)
            ]);

            setUnidadeAtual(unidadeData);

            // Carregar métricas de cada fila
            const metricasPromises = filasData.map(async (fila) => {
                try {
                    const clientesAguardando = await entradaFilaService.listarAguardandoPorFila(fila.id);
                    const aguardando = clientesAguardando.filter(c => c.status === 'AGUARDANDO').length;
                    const prioritarios = clientesAguardando.filter(c => c.prioridade && c.status === 'AGUARDANDO').length;
                    
                    // Calcular tempo médio de espera (simplificado)
                    const temposEspera = clientesAguardando
                        .filter(c => c.status === 'AGUARDANDO')
                        .map(c => {
                            const entrada = new Date(c.dataHoraEntrada);
                            const agora = new Date();
                            return (agora.getTime() - entrada.getTime()) / (1000 * 60); // minutos
                        });
                    
                    const tempoMedioEspera = temposEspera.length > 0 
                        ? temposEspera.reduce((a, b) => a + b, 0) / temposEspera.length 
                        : 0;

                    return {
                        fila,
                        aguardando,
                        prioritarios,
                        tempoMedioEspera
                    };
                } catch (error) {
                    console.error(`❌ Erro ao carregar métricas da fila ${fila.nome}:`, error);
                    return {
                        fila,
                        aguardando: 0,
                        prioritarios: 0,
                        tempoMedioEspera: 0
                    };
                }
            });

            const metricas = await Promise.all(metricasPromises);
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
                atendimentosHoje: 0 // TODO: Implementar contagem real
            });

            console.log('✅ Dashboard atualizado');
        } catch (error: any) {
            console.error('❌ Erro ao carregar dashboard:', error);
            toast({
                title: 'Erro ao carregar dashboard',
                description: error.message,
                variant: 'destructive',
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
                        Visão geral das operações - {unidadeAtual?.nome}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleRefresh} 
                        variant="outline" 
                        size="sm"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Cards de Estatísticas Gerais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Aguardando</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estatisticas?.totalAguardando || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Em todas as filas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prioritários</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
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
                            {estatisticas ? Math.round(estatisticas.tempoMedioGeral) : 0}m
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
                        <div className="text-2xl font-bold">{estatisticas?.totalFilas || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Filas configuradas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção de Filas */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Status das Filas */}
                <Card className="lg:col-span-2">
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
                        <div className="space-y-4">
                            {metricasFilas.map((metrica) => (
                                <div key={metrica.fila.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold">{metrica.fila.nome}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {metrica.fila.setor.nome}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        {/* Aguardando */}
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getStatusColor(metrica.aguardando)}`}>
                                                {metrica.aguardando}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Aguardando</p>
                                        </div>

                                        {/* Prioritários */}
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-orange-600">
                                                {metrica.prioritarios}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Prioritários</p>
                                        </div>

                                        {/* Tempo Médio */}
                                        <div className="text-center min-w-[80px]">
                                            <div className="text-lg font-bold">
                                                {Math.round(metrica.tempoMedioEspera)}m
                                            </div>
                                            <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                                                <div 
                                                    className={`h-full rounded-full ${getProgressColor(metrica.tempoMedioEspera)}`}
                                                    style={{ 
                                                        width: `${Math.min(100, (metrica.tempoMedioEspera / 60) * 100)}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {metrica.aguardando === 0 ? (
                                                <Badge variant="outline" className="border-green-500 text-green-700">
                                                    Sem fila
                                                </Badge>
                                            ) : metrica.aguardando <= 5 ? (
                                                <Badge variant="secondary">
                                                    Normal
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Congestionada
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {metricasFilas.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhuma fila configurada</p>
                                    <p className="text-sm">Configure filas para começar o atendimento</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                            className="h-20 flex flex-col gap-2"
                            variant="outline"
                            onClick={() => window.location.href = '/entrada-fila'}
                        >
                            <UserCheck className="h-6 w-6" />
                            <span>Entrada em Fila</span>
                        </Button>

                        <Button
                            className="h-20 flex flex-col gap-2"
                            variant="outline"
                            onClick={() => window.location.href = '/painel-profissional'}
                        >
                            <Timer className="h-6 w-6" />
                            <span>Painel Profissional</span>
                        </Button>

                        {isAdmin && (
                            <Button
                                className="h-20 flex flex-col gap-2"
                                variant="outline"
                                onClick={() => window.location.href = '/gestao'}
                            >
                                <Building2 className="h-6 w-6" />
                                <span>Gestão</span>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Informações do Usuário */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Informações da Sessão
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Usuário</p>
                            <p className="font-semibold">{user?.nomeUsuario}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Perfil</p>
                            <Badge variant={user?.categoria === 'ADMINISTRADOR' ? 'default' : 'secondary'}>
                                {user?.categoria}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Unidade Atual</p>
                            <p className="font-semibold">{unidadeAtual?.nome}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;