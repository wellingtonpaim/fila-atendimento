import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    UserPlus,
    Users,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2,
    User,
    FileText
} from "lucide-react";

// Importar serviços
import { clienteService } from "@/services/clienteService";
import { filaService } from "@/services/filaService";
import { entradaFilaService } from "@/services/entradaFilaService";
import { authService } from "@/services/authService";

// Importar tipos
import {
    ClienteResponseDTO,
    ClienteCreateDTO,
    FilaResponseDTO,
    EntradaFilaCreateDTO
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const EntradaFila = () => {
    const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [buscaVazia, setBuscaVazia] = useState(true);
    const [filas, setFilas] = useState<FilaResponseDTO[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResponseDTO | null>(null);
    const [filaSelecionada, setFilaSelecionada] = useState<string>('');
    const [prioridade, setPrioridade] = useState(false);
    const [isRetorno, setIsRetorno] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);
    const [novoCliente, setNovoCliente] = useState<ClienteCreateDTO>({
        cpf: '',
        nome: '',
        email: ''
    });
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();
    const currentUser = authService.getUsuario();
    const { selectedUnitId } = useAuth();
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadFilas();
    }, []);

    const loadFilas = async () => {
        try {
            setLoading(true);
            setError(null);
            const filasData = selectedUnitId ? await filaService.listarPorUnidade(selectedUnitId) : [];
            setFilas(Array.isArray(filasData) ? filasData : filasData?.data ?? []);
        } catch (err: any) {
            setError('Erro ao carregar filas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleCriarNovoCliente = async () => {
        try {
            if (!novoCliente.nome.trim() || !novoCliente.cpf.trim() || !novoCliente.email.trim()) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Nome, CPF e email são obrigatórios.',
                    variant: 'destructive',
                });
                return;
            }

            const clienteCriado = await clienteService.criar(novoCliente);
            
            setClientes(prev => [clienteCriado, ...prev]);
            setClienteSelecionado(clienteCriado);
            setShowNovoClienteModal(false);
            setNovoCliente({ cpf: '', nome: '', email: '' });
            
            toast({
                title: 'Sucesso',
                description: 'Cliente criado com sucesso!',
            });
        } catch (error: any) {
            toast({
                title: 'Erro ao criar cliente',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleAdicionarAFila = async () => {
        try {
            if (!clienteSelecionado) {
                toast({
                    title: 'Cliente não selecionado',
                    description: 'Selecione um cliente primeiro.',
                    variant: 'destructive',
                });
                return;
            }

            if (!filaSelecionada) {
                toast({
                    title: 'Fila não selecionada',
                    description: 'Selecione uma fila de destino.',
                    variant: 'destructive',
                });
                return;
            }

            const entrada: EntradaFilaCreateDTO = {
                clienteId: clienteSelecionado.id,
                filaId: filaSelecionada,
                prioridade,
                isRetorno
            };

            await entradaFilaService.adicionarClienteAFila(entrada);

            toast({
                title: 'Sucesso',
                description: `${clienteSelecionado.nome} foi adicionado à fila!`,
            });

            // Limpar seleções
            setClienteSelecionado(null);
            setFilaSelecionada('');
            setPrioridade(false);
            setIsRetorno(false);
            setSearchTerm('');

        } catch (error: any) {
            toast({
                title: 'Erro ao adicionar à fila',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Busca dinâmica no backend
    const buscarClientesBackend = async (termo: string) => {
        setBuscaVazia(termo.trim() === '');
        if (termo.trim() === '') {
            setClientes([]);
            setBuscando(false);
            return;
        }
        setBuscando(true);
        try {
            let resultado: any = null;
            // Detecta tipo de busca
            if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(termo) || /^\d{11}$/.test(termo)) {
                // CPF
                resultado = await clienteService.buscarPorCpf(termo);
                setClientes(resultado?.data ? [resultado.data] : []);
            } else if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(termo)) {
                // Email válido
                if (clienteService.buscarPorEmail) {
                    resultado = await clienteService.buscarPorEmail(termo);
                    setClientes(resultado?.data ? [resultado.data] : []);
                } else {
                    setClientes([]);
                }
            } else {
                // Nome
                resultado = await clienteService.buscarPorNome(termo);
                setClientes(Array.isArray(resultado?.data) ? resultado.data : []);
            }
        } catch (err) {
            setClientes([]);
        } finally {
            setBuscando(false);
        }
    };

    const handleBuscarClientes = (termo: string) => {
        setSearchTerm(termo);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            buscarClientesBackend(termo);
        }, 400);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Carregando dados...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                    <p className="text-destructive">{error}</p>
                </div>
            </div>
        );
    }

    if (filas.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold">Nenhuma fila ativa</h3>
                    <p className="text-muted-foreground">Configure filas para permitir entrada de clientes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entrada em Filas</h1>
                    <p className="text-muted-foreground">
                        Adicione clientes às filas de atendimento
                    </p>
                </div>
                <Dialog open={showNovoClienteModal} onOpenChange={setShowNovoClienteModal}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do novo cliente
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="novo-nome">Nome Completo</Label>
                                <Input
                                    id="novo-nome"
                                    value={novoCliente.nome}
                                    onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                                    placeholder="Digite o nome completo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="novo-cpf">CPF</Label>
                                <Input
                                    id="novo-cpf"
                                    value={novoCliente.cpf}
                                    onChange={(e) => setNovoCliente({...novoCliente, cpf: e.target.value})}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="novo-email">Email</Label>
                                <Input
                                    id="novo-email"
                                    type="email"
                                    value={novoCliente.email}
                                    onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowNovoClienteModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCriarNovoCliente}>
                                Criar Cliente
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Seleção de Cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Selecionar Cliente
                        </CardTitle>
                        <CardDescription>
                            Busque e selecione o cliente para adicionar à fila
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Busca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, CPF ou email..."
                                value={searchTerm}
                                onChange={(e) => handleBuscarClientes(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {buscando && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                                    <p>Buscando clientes...</p>
                                </div>
                            )}
                            {!buscando && buscaVazia && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Digite para buscar clientes</p>
                                </div>
                            )}
                            {!buscando && !buscaVazia && clientes.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum cliente encontrado</p>
                                    <p className="text-sm">Tente ajustar sua busca ou cadastre um novo cliente</p>
                                </div>
                            )}
                            {!buscando && clientes.length > 0 && clientes.map((cliente) => (
                                <div
                                    key={cliente.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        clienteSelecionado?.id === cliente.id
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => setClienteSelecionado(cliente)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{cliente.nome}</p>
                                            <p className="text-sm text-muted-foreground">{cliente.cpf}</p>
                                            <p className="text-sm text-muted-foreground">{cliente.email}</p>
                                        </div>
                                        {clienteSelecionado?.id === cliente.id && (
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Configuração da Entrada */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Configurar Entrada na Fila
                        </CardTitle>
                        <CardDescription>
                            Configure os detalhes da entrada na fila
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Cliente Selecionado */}
                        {clienteSelecionado ? (
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="font-medium text-primary">Cliente Selecionado:</p>
                                <p className="font-semibold">{clienteSelecionado.nome}</p>
                                <p className="text-sm text-muted-foreground">{clienteSelecionado.cpf}</p>
                            </div>
                        ) : (
                            <div className="p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Selecione um cliente primeiro</p>
                            </div>
                        )}

                        {/* Seleção de Fila */}
                        <div className="space-y-2">
                            <Label htmlFor="fila-select">Fila de Destino</Label>
                            <Select value={filaSelecionada} onValueChange={setFilaSelecionada}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a fila" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filas.map((fila) => (
                                        <SelectItem key={fila.id} value={fila.id}>
                                            <div className="flex flex-col">
                                                <span>{fila.nome}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {fila.setor.nome} - {fila.unidade.nome}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Opções */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="prioridade"
                                    checked={prioridade}
                                    onCheckedChange={(checked) => setPrioridade(!!checked)}
                                />
                                <Label htmlFor="prioridade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Atendimento Prioritário
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="retorno"
                                    checked={isRetorno}
                                    onCheckedChange={(checked) => setIsRetorno(!!checked)}
                                />
                                <Label htmlFor="retorno" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Retorno
                                </Label>
                            </div>
                        </div>

                        {/* Botão de Adicionar */}
                        <Button 
                            onClick={handleAdicionarAFila}
                            disabled={!clienteSelecionado || !filaSelecionada}
                            className="w-full"
                            size="lg"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar à Fila
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EntradaFila;
