import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Phone,
    UserCheck,
    Users,
    Clock,
    AlertCircle,
    XCircle,
    ArrowRight,
    Loader2,
    Timer,
    User,
    Activity,
    Stethoscope,
    RefreshCw,
    FileCheck
} from "lucide-react";

// Importar serviços
import { entradaFilaService } from "@/services/entradaFilaService";
import { filaService } from "@/services/filaService";
import { clienteService } from "@/services/clienteService";
import { useAuth } from "@/contexts/AuthContext";

// Importar tipos
import {
    EntradaFilaResponseDTO,
    FilaResponseDTO,
    EntradaFilaCreateDTO,
    ClienteResponseDTO
} from "@/types";

// Interface atualizada para corresponder à resposta real da API
interface EntradaFilaComClienteDTO {
    id: string;
    status: string;
    prioridade: boolean;
    isRetorno: boolean;
    dataHoraEntrada: string;
    dataHoraChamada?: string;
    dataHoraSaida?: string;
    guicheOuSalaAtendimento?: string;
    cliente: {
        id: string;
        cpf: string;
        nome: string;
        email: string;
        telefones: Array<{
            tipo: string;
            ddd: number;
            numero: number;
        }>;
        endereco: {
            cep: string;
            logradouro: string;
            numero: string;
            complemento: string;
            bairro: string;
            cidade: string;
            uf: string;
            enderecoFormatado: string;
        };
    };
    fila: {
        id: string;
        nome: string;
        setor: {
            id: string;
            nome: string;
        };
        unidade: {
            id: string;
            nome: string;
        };
    };
    usuarioResponsavelId?: string;
}

const PainelProfissional = () => {
    const [filasDisponiveis, setFilasDisponiveis] = useState<FilaResponseDTO[]>([]);
    const [filaSelecionada, setFilaSelecionada] = useState<string>('');
    const [clientesAguardando, setClientesAguardando] = useState<EntradaFilaComClienteDTO[]>([]);
    const [clienteAtual, setClienteAtual] = useState<EntradaFilaComClienteDTO | null>(null);
    const [guiche, setGuiche] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [showEncaminharModal, setShowEncaminharModal] = useState(false);
    const [filaEncaminhamento, setFilaEncaminhamento] = useState('');
    const [isPrioridade, setIsPrioridade] = useState(false);
    const [isRetorno, setIsRetorno] = useState(false);
    const [observacoes, setObservacoes] = useState('');
    const [tipoFinalizacao, setTipoFinalizacao] = useState<'encaminhar' | 'alta' | ''>('');
    const [tempoAtendimento, setTempoAtendimento] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const { user, selectedUnitId } = useAuth();

    useEffect(() => {
        loadData();
    }, [selectedUnitId]);

    useEffect(() => {
        if (filaSelecionada) {
            loadClientesAguardando();
            // Atualizar a cada 30 segundos
            const interval = setInterval(loadClientesAguardando, 30000);
            return () => clearInterval(interval);
        }
    }, [filaSelecionada]);

    // Timer para tempo de atendimento
    useEffect(() => {
        if (clienteAtual && clienteAtual.status === 'CHAMADO' && clienteAtual.dataHoraChamada) {
            const inicioAtendimento = new Date(clienteAtual.dataHoraChamada).getTime();
            const interval = setInterval(() => {
                const agora = Date.now();
                const tempoDecorrido = Math.floor((agora - inicioAtendimento) / 1000);
                setTempoAtendimento(tempoDecorrido);
            }, 1000);
            setIntervalId(interval);
            return () => {
                if (interval) clearInterval(interval);
            };
        } else {
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
            setTempoAtendimento(0);
        }
    }, [clienteAtual]);

    // Função para buscar dados completos do cliente por ID
    const buscarDadosCliente = async (clienteId: string): Promise<ClienteResponseDTO | null> => {
        try {
            console.log('🔍 Buscando dados do cliente:', clienteId);
            const cliente = await clienteService.buscarPorId(clienteId);
            console.log('✅ Cliente encontrado:', cliente);
            return cliente;
        } catch (error: any) {
            console.error('❌ Erro ao buscar cliente:', error);
            return null;
        }
    };

    // Função para enriquecer entrada na fila com dados do cliente
    const enriquecerEntradaComCliente = async (entrada: EntradaFilaResponseDTO): Promise<EntradaFilaComClienteDTO | null> => {
        const cliente = await buscarDadosCliente(entrada.clienteId);
        if (!cliente) return null;

        return {
            ...entrada,
            cliente,
            prioridade: false, // TODO: Buscar da API se disponível
            isRetorno: false,  // TODO: Buscar da API se disponível
            dataHoraEntrada: entrada.horaEntrada,
            dataHoraChamada: entrada.horaChamada,
            guicheOuSalaAtendimento: ''
        };
    };

    const loadData = async () => {
        try {
            setLoading(true);
            
            if (!selectedUnitId) {
                toast({
                    title: 'Erro',
                    description: 'Nenhuma unidade selecionada.',
                    variant: 'destructive',
                });
                return;
            }

            // Carregar filas da unidade
            const filasData = await filaService.listarPorUnidade(selectedUnitId);
            setFilasDisponiveis(filasData);

            console.log('✅ Filas carregadas:', filasData.length);
        } catch (error: any) {
            console.error('❌ Erro ao carregar dados:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadClientesAguardando = async () => {
        if (!filaSelecionada) return;

        try {
            console.log('🔍 Debug - Carregando clientes da fila:', filaSelecionada);
            const clientes = await entradaFilaService.listarAguardandoPorFila(filaSelecionada);
            console.log('🔍 Debug - Clientes retornados completos:', clientes);
            console.log('🔍 Debug - Status de cada cliente:', clientes.map(c => ({ id: c.id.substring(0,8), status: c.status, nome: c.cliente?.nome })));

            // A API já retorna os dados completos! Não preciso buscar individualmente
            setClientesAguardando(clientes as EntradaFilaComClienteDTO[]);

            // Verificar cliente em atendimento - expandir critérios de busca
            const clienteEmAtendimento = clientes.find((c: any) => {
                const isEmAtendimento = c.status === 'CHAMADO' ||
                                       c.status === 'EM_ATENDIMENTO' ||
                                       c.dataHoraChamada !== null ||
                                       c.usuarioResponsavelId !== null;

                console.log(`🔍 Cliente ${c.cliente?.nome}: status=${c.status}, chamada=${c.dataHoraChamada}, responsavel=${c.usuarioResponsavelId}, isEmAtendimento=${isEmAtendimento}`);

                return isEmAtendimento;
            });

            console.log('🔍 Debug - Cliente em atendimento encontrado:', clienteEmAtendimento);
            setClienteAtual(clienteEmAtendimento as EntradaFilaComClienteDTO || null);

        } catch (error: any) {
            console.error('❌ Erro ao carregar clientes aguardando:', error);
            toast({
                title: 'Erro ao carregar fila',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleChamarProximo = async () => {
        if (!filaSelecionada || !user || !guiche.trim()) {
            toast({
                title: 'Dados incompletos',
                description: 'Selecione uma fila e informe o guichê.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoadingAction(true);
            
            console.log('🔍 Debug - Chamando próximo cliente...', { filaSelecionada, userId: user.id, guiche });
            const entradaChamada = await entradaFilaService.chamarProximo(
                filaSelecionada,
                user.id,
                guiche.trim()
            );

            console.log('🔍 Debug - Entrada chamada retornada:', entradaChamada);

            // Aguardar um momento para o backend processar
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Forçar múltiplas atualizações para garantir que a mudança seja capturada
            await loadClientesAguardando();

            // Segunda tentativa após mais um momento
            setTimeout(async () => {
                await loadClientesAguardando();
            }, 2000);

            toast({
                title: 'Cliente chamado!',
                description: 'Próximo cliente foi chamado para atendimento.',
            });

        } catch (error: any) {
            console.error('❌ Erro ao chamar próximo cliente:', error);
            toast({
                title: 'Erro ao chamar cliente',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleFinalizarAtendimento = async () => {
        if (!clienteAtual) return;

        try {
            setLoadingAction(true);
            
            await entradaFilaService.finalizarAtendimento(clienteAtual.id);
            
            setClienteAtual(null);
            await loadClientesAguardando();

            toast({
                title: 'Atendimento finalizado!',
                description: 'O atendimento foi concluído com sucesso.',
            });
        } catch (error: any) {
            console.error('❌ Erro ao finalizar atendimento:', error);
            toast({
                title: 'Erro ao finalizar atendimento',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleCancelarAtendimento = async () => {
        if (!clienteAtual) return;

        try {
            setLoadingAction(true);
            
            await entradaFilaService.cancelarAtendimento(clienteAtual.id);
            
            setClienteAtual(null);
            await loadClientesAguardando();

            toast({
                title: 'Atendimento cancelado',
                description: 'O atendimento foi cancelado.',
                variant: 'destructive',
            });
        } catch (error: any) {
            console.error('❌ Erro ao cancelar atendimento:', error);
            toast({
                title: 'Erro ao cancelar atendimento',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleEncaminhar = async () => {
        if (!clienteAtual || !filaEncaminhamento) {
            toast({
                title: 'Dados incompletos',
                description: 'Selecione uma fila de destino.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoadingAction(true);
            
            const novaEntrada: EntradaFilaCreateDTO = {
                clienteId: clienteAtual.cliente.id,
                filaId: filaEncaminhamento,
                prioridade: isPrioridade,
                isRetorno: isRetorno
            };

            await entradaFilaService.encaminharParaFila(clienteAtual.id, novaEntrada);
            
            setClienteAtual(null);
            setShowEncaminharModal(false);
            setFilaEncaminhamento('');
            setIsPrioridade(false);
            setIsRetorno(false);
            setObservacoes('');
            await loadClientesAguardando();

            toast({
                title: 'Cliente encaminhado!',
                description: 'O cliente foi encaminhado para outra fila.',
            });
        } catch (error: any) {
            console.error('❌ Erro ao encaminhar cliente:', error);
            toast({
                title: 'Erro ao encaminhar cliente',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDarAlta = async () => {
        if (!clienteAtual) return;

        try {
            setLoadingAction(true);

            await entradaFilaService.finalizarAtendimento(clienteAtual.id);

            setClienteAtual(null);
            setShowEncaminharModal(false);
            await loadClientesAguardando();

            toast({
                title: 'Alta médica concedida!',
                description: `${clienteAtual.cliente.nome} recebeu alta e saiu do sistema.`,
            });
        } catch (error: any) {
            console.error('❌ Erro ao dar alta:', error);
            toast({
                title: 'Erro ao dar alta',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoadingAction(false);
        }
    };

    const resetModalEncaminhamento = () => {
        setTipoFinalizacao('');
        setFilaEncaminhamento('');
        setIsPrioridade(false);
        setIsRetorno(false);
        setObservacoes('');
    };

    const handleAbrirModalEncaminhamento = () => {
        resetModalEncaminhamento();
        setShowEncaminharModal(true);
    };

    const formatarTempo = (segundos: number): string => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AGUARDANDO':
                return <Badge variant="secondary">Aguardando</Badge>;
            case 'CHAMADO':
                return <Badge variant="default">Chamado</Badge>;
            case 'ATENDIDO':
                return <Badge variant="outline" className="border-green-500 text-green-700">Atendido</Badge>;
            case 'CANCELADO':
                return <Badge variant="destructive">Cancelado</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Carregando painel profissional...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel do Profissional</h1>
                    <p className="text-muted-foreground">
                        Gerencie o atendimento aos clientes
                    </p>
                </div>
                <Button onClick={loadClientesAguardando} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Button>
            </div>

            {/* Configuração inicial */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Seleção de Fila */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            Configuração do Atendimento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fila-select">Fila de Atendimento</Label>
                            <Select value={filaSelecionada} onValueChange={setFilaSelecionada}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione sua fila" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filasDisponiveis.map((fila) => (
                                        <SelectItem key={fila.id} value={fila.id}>
                                            <div className="flex flex-col">
                                                <span>{fila.nome}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {fila.setor.nome}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guiche">Guichê/Sala</Label>
                            <Input
                                id="guiche"
                                placeholder="Ex: Guichê 01, Sala 3"
                                value={guiche}
                                onChange={(e) => setGuiche(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Estatísticas da Fila
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {clientesAguardando.filter(c => c.status === 'AGUARDANDO').length}
                                </div>
                                <p className="text-sm text-muted-foreground">Aguardando</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {clientesAguardando.filter(c => c.prioridade).length}
                                </div>
                                <p className="text-sm text-muted-foreground">Prioritários</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {filaSelecionada && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Cliente Atual */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5" />
                                Cliente em Atendimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {clienteAtual ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">{clienteAtual.cliente?.nome || 'Cliente'}</h3>
                                            {getStatusBadge(clienteAtual.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            CPF: {clienteAtual.cliente?.cpf || 'Não informado'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Entrada: {new Date(clienteAtual.dataHoraEntrada).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        {clienteAtual.dataHoraChamada && (
                                            <p className="text-sm text-muted-foreground">
                                                Chamado: {new Date(clienteAtual.dataHoraChamada).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                        {clienteAtual.prioridade && (
                                            <Badge variant="secondary" className="mt-2">
                                                Prioritário
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Timer */}
                                    <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                                        <Timer className="mr-2 h-5 w-5" />
                                        <span className="text-lg font-mono">{formatarTempo(tempoAtendimento)}</span>
                                    </div>

                                    {/* Ações do Atendimento Refatoradas */}
                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleCancelarAtendimento}
                                            disabled={loadingAction}
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <XCircle className="mr-1 h-4 w-4" />
                                            Cancelar Atendimento
                                        </Button>

                                        {/* Botão direto para encaminhar cliente */}
                                        <Dialog open={showEncaminharModal} onOpenChange={setShowEncaminharModal}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => {
                                                        resetModalEncaminhamento();
                                                        setTipoFinalizacao('encaminhar');
                                                        setShowEncaminharModal(true);
                                                    }}
                                                    variant="default"
                                                    className="w-full"
                                                    size="sm"
                                                >
                                                    <ArrowRight className="mr-1 h-4 w-4" />
                                                    Encaminhar Cliente
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Encaminhar Cliente</DialogTitle>
                                                    <DialogDescription>
                                                        Selecione a fila de destino para {clienteAtual.cliente.nome}.
                                                        O cliente será automaticamente removido da fila atual.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                {/* Opções de encaminhamento direto */}
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Fila de Destino *</Label>
                                                        <Select value={filaEncaminhamento} onValueChange={setFilaEncaminhamento}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione a fila de destino" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filasDisponiveis
                                                                    .filter(f => f.id !== filaSelecionada)
                                                                    .map((fila) => (
                                                                    <SelectItem key={fila.id} value={fila.id}>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{fila.nome}</span>
                                                                            <span className="text-xs text-muted-foreground">{fila.setor.nome}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id="prioridade"
                                                                checked={isPrioridade}
                                                                onChange={(e) => setIsPrioridade(e.target.checked)}
                                                                className="rounded border-gray-300"
                                                            />
                                                            <Label htmlFor="prioridade" className="text-sm">Atendimento prioritário</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id="retorno"
                                                                checked={isRetorno}
                                                                onChange={(e) => setIsRetorno(e.target.checked)}
                                                                className="rounded border-gray-300"
                                                            />
                                                            <Label htmlFor="retorno" className="text-sm">Retorno</Label>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="observacoes">Observações</Label>
                                                        <textarea
                                                            id="observacoes"
                                                            placeholder="Observações sobre o encaminhamento (opcional)"
                                                            value={observacoes}
                                                            onChange={(e) => setObservacoes(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20 text-sm"
                                                        />
                                                    </div>

                                                    <div className="flex justify-between gap-2 pt-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowEncaminharModal(false)}
                                                            size="sm"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            onClick={handleEncaminhar}
                                                            disabled={loadingAction || !filaEncaminhamento}
                                                            size="sm"
                                                        >
                                                            {loadingAction ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                            )}
                                                            Encaminhar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Botão para dar alta médica */}
                                        <Button
                                            onClick={handleDarAlta}
                                            disabled={loadingAction}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <FileCheck className="mr-1 h-4 w-4" />
                                            Dar Alta Médica
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum cliente em atendimento</p>
                                    <Button 
                                        onClick={handleChamarProximo}
                                        disabled={loadingAction || !guiche.trim() || clientesAguardando.filter(c => c.status === 'AGUARDANDO').length === 0}
                                        className="mt-4"
                                        size="lg"
                                    >
                                        {loadingAction ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Phone className="mr-2 h-4 w-4" />
                                        )}
                                        Chamar Próximo
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Fila de Clientes */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Clientes Aguardando ({clientesAguardando.filter(c => c.status === 'AGUARDANDO').length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {clientesAguardando.filter(c => c.status === 'AGUARDANDO').map((cliente, index) => (
                                    <div key={cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{cliente.cliente?.nome || 'Cliente'}</p>
                                                <p className="text-sm text-muted-foreground">{cliente.cliente?.cpf || 'CPF não informado'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {cliente.id.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {cliente.prioridade && (
                                                <Badge variant="secondary">Prioritário</Badge>
                                            )}
                                            {cliente.isRetorno && (
                                                <Badge variant="outline">Retorno</Badge>
                                            )}
                                            <div className="flex items-center text-muted-foreground text-sm">
                                                <Clock className="mr-1 h-4 w-4" />
                                                {new Date(cliente.dataHoraEntrada).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {clientesAguardando.filter(c => c.status === 'AGUARDANDO').length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Nenhum cliente aguardando</p>
                                        <p className="text-sm">A fila está vazia</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!filaSelecionada && (
                <Card>
                    <CardContent className="flex items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                            <div>
                                <h3 className="text-lg font-semibold">Selecione uma fila</h3>
                                <p className="text-muted-foreground">
                                    Escolha a fila de atendimento para começar a trabalhar
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PainelProfissional;
