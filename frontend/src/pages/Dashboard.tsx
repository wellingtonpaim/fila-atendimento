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
    AlertTriangle,
    Building2,
    Loader2,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { filaService } from '@/services/filaService';
import { unidadeService } from '@/services/unidadeService';
import { entradaFilaService } from '@/services/entradaFilaService';
import { dashboardService } from '@/services/dashboardService';
import { FilaResponseDTO, UnidadeAtendimentoResponseDTO, TempoEsperaDTO, ProdutividadeDTO, HorarioPicoDTO, FluxoPacientesDTO } from '@/types';
import { format, parseISO } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line, AreaChart, Area, LabelList } from 'recharts';

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

// Tipos auxiliares de UI
type Periodo = 'hoje' | '7d' | '30d' | 'custom';

const Dashboard = () => {
    const [unidadeAtual, setUnidadeAtual] = useState<UnidadeAtendimentoResponseDTO | null>(null);
    const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
    const [metricasFilas, setMetricasFilas] = useState<MetricasFila[]>([]);

    // Novos estados para gráficos do dashboard
    const [tempoEsperaData, setTempoEsperaData] = useState<TempoEsperaDTO[]>([]);
    const [produtividadeData, setProdutividadeData] = useState<ProdutividadeDTO[]>([]);
    const [horariosPicoData, setHorariosPicoData] = useState<HorarioPicoDTO[]>([]);
    const [fluxoPacientesData, setFluxoPacientesData] = useState<FluxoPacientesDTO[]>([]);

    // Filtro de período
    const [periodo, setPeriodo] = useState<Periodo>('hoje');
    const [customInicio, setCustomInicio] = useState<string>(''); // datetime-local
    const [customFim, setCustomFim] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { toast } = useToast();
    const { user, selectedUnitId, isAdmin } = useAuth();

    useEffect(() => {
        loadDashboardData();
        // Atualizar dados a cada 60 segundos
        const interval = setInterval(() => loadDashboardData(true), 60000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo, customInicio, customFim, selectedUnitId]);

    const calcularIntervalo = () => {
        const agora = new Date();
        let inicioDate: Date;
        let fimDate: Date;

        if (periodo === 'custom' && customInicio && customFim) {
            // Converter datetime-local para ISO
            inicioDate = new Date(customInicio);
            fimDate = new Date(customFim);
        } else if (periodo === '7d') {
            fimDate = agora;
            inicioDate = new Date(agora);
            inicioDate.setDate(inicioDate.getDate() - 7);
        } else if (periodo === '30d') {
            fimDate = agora;
            inicioDate = new Date(agora);
            inicioDate.setDate(inicioDate.getDate() - 30);
        } else {
            // Hoje (meia-noite até 23:59:59)
            inicioDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
            fimDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
        }

        return { inicio: inicioDate.toISOString(), fim: fimDate.toISOString() };
    };

    const loadDashboardData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // Buscar unidade selecionada
            let unidadeData: UnidadeAtendimentoResponseDTO | null = null;
            let filasData: FilaResponseDTO[] = [];
            try {
                if (selectedUnitId) {
                    const unidadeResponse = await unidadeService.buscarPorId(selectedUnitId);
                    unidadeData = unidadeResponse.data || null;
                    setUnidadeAtual(unidadeData);
                    const filasResponse = await filaService.listarPorUnidade(selectedUnitId);
                    filasData = filasResponse.data || [];
                } else {
                    const unidadesResponse = await unidadeService.listarTodas();
                    const unidades = unidadesResponse.data || [];
                    if (unidades.length > 0) {
                        unidadeData = unidades[0];
                        setUnidadeAtual(unidadeData);
                        const filasResponse = await filaService.listarPorUnidade(unidadeData.id);
                        filasData = filasResponse.data || [];
                    }
                }
            } catch (e: any) {
                console.error('[Dashboard] Erro ao carregar unidade/filas:', e);
                // Segue com dados vazios, demais seções já testam unidadeData
                unidadeData = unidadeData || null;
                filasData = filasData || [];
            }

            const { inicio, fim } = calcularIntervalo();

            // Tempo médio por fila: também popular dados para gráfico
            let tempoMedioPorFila: Record<string, number> = {};
            if (unidadeData) {
                try {
                    const tempos = await dashboardService.tempoMedioEspera(unidadeData.id, inicio, fim);
                    setTempoEsperaData(tempos);
                    // mapear por id da fila (via nome)
                    tempos.forEach((t) => {
                        const filaMatch = filasData.find((f) => (f.nome || '').toLowerCase() === (t.filaNome || '').toLowerCase());
                        if (filaMatch) tempoMedioPorFila[filaMatch.id] = t.tempoMedioEsperaMinutos || 0;
                    });
                } catch (err) {
                    console.error('[Dashboard] Erro em tempoMedioEspera:', err);
                    tempoMedioPorFila = {};
                    setTempoEsperaData([]);
                }
            }

            // Buscar clientes aguardando por fila (tempo real)
            const metricas: MetricasFila[] = [];
            for (const fila of filasData) {
                let aguardando = 0;
                let prioritarios = 0;
                try {
                    const aguardandoLista = await entradaFilaService.listarAguardandoPorFila(fila.id);
                    const clientes = Array.isArray(aguardandoLista) ? aguardandoLista : [];
                    aguardando = clientes.length;
                    prioritarios = clientes.filter((c: any) => c.prioridade).length;
                } catch (err) {
                    console.warn('[Dashboard] Erro ao listar aguardando por fila', fila.id, err);
                    aguardando = 0;
                    prioritarios = 0;
                }
                metricas.push({
                    fila,
                    aguardando,
                    prioritarios,
                    tempoMedioEspera: tempoMedioPorFila[fila.id] || 0,
                });
            }
            setMetricasFilas(metricas);

            // Produtividade
            let atendimentosHoje = 0;
            if (unidadeData) {
                try {
                    const produtividade = await dashboardService.produtividade(unidadeData.id, inicio, fim);
                    setProdutividadeData(produtividade);
                    atendimentosHoje = produtividade.reduce((sum, p) => sum + (p.atendimentosRealizados || 0), 0);
                } catch (err) {
                    console.error('[Dashboard] Erro em produtividade:', err);
                    setProdutividadeData([]);
                    atendimentosHoje = 0;
                }
            }

            // Horários de pico
            if (unidadeData) {
                try {
                    const horarios = await dashboardService.horariosPico(unidadeData.id, inicio, fim);
                    setHorariosPicoData(horarios);
                } catch (err) {
                    console.error('[Dashboard] Erro em horariosPico:', err);
                    setHorariosPicoData([]);
                }
            }

            // Fluxo de pacientes
            if (unidadeData) {
                try {
                    const fluxo = await dashboardService.fluxoPacientes(unidadeData.id, inicio, fim);
                    setFluxoPacientesData(fluxo);
                } catch (err) {
                    console.error('[Dashboard] Erro em fluxoPacientes:', err);
                    setFluxoPacientesData([]);
                }
            }

            // Calcular estatísticas gerais
            const totalAguardando = metricas.reduce((sum, m) => sum + m.aguardando, 0);
            const totalPrioritarios = metricas.reduce((sum, m) => sum + m.prioritarios, 0);
            const tempoMedioGeral = metricas.length > 0 ? metricas.reduce((sum, m) => sum + m.tempoMedioEspera, 0) / metricas.length : 0;

            setEstatisticas({ totalFilas: filasData.length, totalAguardando, totalPrioritarios, tempoMedioGeral, atendimentosHoje });
        } catch (error: any) {
            console.error('[Dashboard] Erro inesperado no carregamento:', error);
            setEstatisticas({ totalFilas: 0, totalAguardando: 0, totalPrioritarios: 0, tempoMedioGeral: 0, atendimentosHoje: 0 });
            setMetricasFilas([]);
            setTempoEsperaData([]);
            setProdutividadeData([]);
            setHorariosPicoData([]);
            setFluxoPacientesData([]);
            toast({ title: 'Aviso', description: 'Alguns dados podem não estar disponíveis. Configure filas para ver mais informações.', variant: 'default' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => loadDashboardData(true);

    const getStatusColor = (aguardando: number): string => {
        if (aguardando === 0) return 'text-green-600';
        if (aguardando <= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatTempo = (minutos: number): string => {
        if (minutos < 60) return `${Math.round(minutos)}m`;
        const horas = Math.floor(minutos / 60);
        const mins = Math.round(minutos % 60);
        return `${horas}h ${mins}m`;
    };

    // Dados derivados para gráficos
    const horariosPicoAggregated = (() => {
        const map = new Map<string, number>();
        for (const h of horariosPicoData) {
            try {
                const hora = format(parseISO(h.horario), 'HH:mm');
                map.set(hora, (map.get(hora) || 0) + (h.quantidadeAtendimentos || 0));
            } catch {}
        }
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([hora, quantidade]) => ({ hora, quantidade }));
    })();

    const fluxoPacientesBarData = fluxoPacientesData.map((f) => ({
        caminho: `${f.setorOrigem} → ${f.setorDestino}`,
        quantidade: f.quantidadePacientes || 0,
    }));

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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Visão geral das operações{unidadeAtual ? ` - ${unidadeAtual.nome}` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filtro de período */}
                    <select
                        className="px-2 py-1 text-sm rounded-md border border-input bg-background text-foreground"
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value as Periodo)}
                        aria-label="Selecionar período"
                    >
                        <option value="hoje">Hoje</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="custom">Personalizado</option>
                    </select>
                    {periodo === 'custom' && (
                        <>
                            <input
                                type="datetime-local"
                                className="px-2 py-1 text-sm rounded-md border border-input bg-background text-foreground"
                                value={customInicio}
                                onChange={(e) => setCustomInicio(e.target.value)}
                                aria-label="Início do período"
                            />
                            <input
                                type="datetime-local"
                                className="px-2 py-1 text-sm rounded-md border border-input bg-background text-foreground"
                                value={customFim}
                                onChange={(e) => setCustomFim(e.target.value)}
                                aria-label="Fim do período"
                            />
                        </>
                    )}
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

            {/* Tempo médio de espera por fila */}
            <Card>
                <CardHeader>
                    <CardTitle>Tempo médio de espera por fila</CardTitle>
                    <CardDescription>Período selecionado</CardDescription>
                </CardHeader>
                <CardContent>
                    {tempoEsperaData.length > 0 ? (
                        <ChartContainer
                            config={{ tempo: { label: 'Tempo médio (min)', color: 'hsl(var(--primary))' } }}
                            className="h-[300px]"
                        >
                            <BarChart data={tempoEsperaData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="filaNome" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="tempoMedioEsperaMinutos" name="Tempo médio (min)" fill="var(--color-tempo, hsl(var(--primary)))">
                                    <LabelList dataKey="tempoMedioEsperaMinutos" position="top" formatter={(v: number) => Math.round(v)} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sem dados para o período.</p>
                    )}
                </CardContent>
            </Card>

            {/* Produtividade por profissional */}
            <Card>
                <CardHeader>
                    <CardTitle>Produtividade por profissional</CardTitle>
                    <CardDescription>Atendimentos e tempo médio</CardDescription>
                </CardHeader>
                <CardContent>
                    {produtividadeData.length > 0 ? (
                        <ChartContainer
                            config={{
                                atend: { label: 'Atendimentos', color: 'hsl(var(--chart-1))' },
                                tempo: { label: 'Tempo médio (min)', color: 'hsl(var(--chart-2))' },
                            }}
                            className="h-[320px]"
                        >
                            <ComposedChart data={produtividadeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="profissionalNome" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="atendimentosRealizados" name="Atendimentos" fill="var(--color-atend, hsl(var(--chart-1)))">
                                    <LabelList dataKey="atendimentosRealizados" position="top" />
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="tempoMedioAtendimentoMinutos" name="Tempo médio (min)" stroke="var(--color-tempo, hsl(var(--chart-2)))" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sem dados para o período.</p>
                    )}
                </CardContent>
            </Card>

            {/* Horários de pico */}
            <Card>
                <CardHeader>
                    <CardTitle>Horários de pico</CardTitle>
                    <CardDescription>Quantidade de atendimentos por horário</CardDescription>
                </CardHeader>
                <CardContent>
                    {horariosPicoAggregated.length > 0 ? (
                        <ChartContainer
                            config={{ qtd: { label: 'Atendimentos', color: 'hsl(var(--chart-3))' } }}
                            className="h-[300px]"
                        >
                            <AreaChart data={horariosPicoAggregated}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hora" />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="quantidade" name="Atendimentos" stroke="var(--color-qtd, hsl(var(--chart-3)))" fill="var(--color-qtd, hsl(var(--chart-3)))" fillOpacity={0.2} />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sem dados para o período.</p>
                    )}
                </CardContent>
            </Card>

            {/* Fluxo de pacientes entre setores */}
            <Card>
                <CardHeader>
                    <CardTitle>Fluxo de pacientes entre setores</CardTitle>
                    <CardDescription>Origem → Destino</CardDescription>
                </CardHeader>
                <CardContent>
                    {fluxoPacientesBarData.length > 0 ? (
                        <ChartContainer
                            config={{ flux: { label: 'Pacientes', color: 'hsl(var(--chart-4))' } }}
                            className="h-[300px]"
                        >
                            <BarChart data={fluxoPacientesBarData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="caminho" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="quantidade" name="Pacientes" fill="var(--color-flux, hsl(var(--chart-4)))">
                                    <LabelList dataKey="quantidade" position="top" />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sem dados para o período.</p>
                    )}
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

