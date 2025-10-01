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
    FileText,
    RefreshCw
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
    const [page, setPage] = useState(0); // Corrigido para iniciar em 0
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchType, setSearchType] = useState<'nome' | 'cpf' | 'email' | 'telefone'>('nome');
    const { toast } = useToast();
    const currentUser = authService.getUsuario();
    const { selectedUnitId } = useAuth();
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadFilas();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            buscarClientesBackend(searchTerm, page, size);
        }
    }, [page, size]);

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

    // Busca dinâmica no backend com paginação
    const buscarClientesBackend = async (termo: string, pageParam = 1, sizeParam = 10) => {
        setBuscaVazia(termo.trim() === '');
        if (termo.trim() === '') {
            setClientes([]);
            setBuscando(false);
            setTotalPages(1);
            setTotalElements(0);
            return;
        }
        setBuscando(true);
        try {
            let response;
            if (searchType === 'cpf') {
                response = await clienteService.buscarPorCpf(termo);
                setClientes(response?.data ? [response.data] : []);
                setTotalPages(1);
                setTotalElements(response?.data ? 1 : 0);
            } else if (searchType === 'email') {
                response = await clienteService.buscarPorEmail(termo, pageParam, sizeParam);
                setClientes(Array.isArray(response?.data) ? response.data : []);
                setTotalPages(response?.totalPages || 1);
                setTotalElements(response?.totalElements || response?.data?.length || 0);
            } else if (searchType === 'telefone') {
                response = await clienteService.buscarPorTelefone(termo, pageParam, sizeParam);
                setClientes(Array.isArray(response?.data) ? response.data : []);
                setTotalPages(response?.totalPages || 1);
                setTotalElements(response?.totalElements || response?.data?.length || 0);
            } else {
                // Nome
                response = await clienteService.buscarPorNome(termo, pageParam, sizeParam);
                setClientes(Array.isArray(response?.data) ? response.data : []);
                setTotalPages(response?.totalPages || 1);
                setTotalElements(response?.totalElements || response?.data?.length || 0);
            }
        } catch (err) {
            setClientes([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setBuscando(false);
        }
    };

    const handleBuscarClientes = (termo: string) => {
        setSearchTerm(termo);
        setPage(0); // Corrigido para iniciar em 0
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            buscarClientesBackend(termo, 0, size); // Corrigido para iniciar em 0
        }, 600);
    };

    const handleKeyDownBusca = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
            buscarClientesBackend(searchTerm, 0, size); // Corrigido para iniciar em 0
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSize(Number(e.target.value));
        setPage(1);
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
                {/* Botão de atualizar seguindo padrão Dashboard */}
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => { setSearchTerm(''); setClientes([]); setClienteSelecionado(null); setPage(0); loadFilas(); }}
                    aria-label="Atualizar"
                >
                    <RefreshCw className="h-5 w-5" />
                    <span>Atualizar</span>
                </Button>
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
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium">Buscar por:</label>
                            <select
                                value={searchType}
                                onChange={e => { setSearchType(e.target.value as any); setSearchTerm(''); setClientes([]); setPage(0); }}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                <option value="nome">Nome</option>
                                <option value="cpf">CPF</option>
                                <option value="email">Email</option>
                                <option value="telefone">Telefone</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchType === 'nome' ? 'Buscar por nome...' : searchType === 'cpf' ? 'Buscar por CPF...' : searchType === 'email' ? 'Buscar por email...' : 'Buscar por telefone...'}
                                value={searchTerm}
                                onChange={(e) => handleBuscarClientes(e.target.value)}
                                onKeyDown={handleKeyDownBusca}
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
                            {/* When a client is selected, clear search results and search term */}
                            {!buscando && clientes.length > 0 && !clienteSelecionado && clientes.map((cliente) => (
                                <div
                                    key={cliente.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        clienteSelecionado?.id === cliente.id
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => {
                                        setClienteSelecionado(cliente);
                                        setClientes([]);
                                        setSearchTerm('');
                                        setBuscaVazia(true);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{cliente.nome}</p>
                                            <p className="text-sm text-muted-foreground">{cliente.cpf}</p>
                                            <p className="text-sm text-muted-foreground">{cliente.email}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {Array.isArray(cliente.telefones) && cliente.telefones.length > 0
                                                    ? cliente.telefones.map(t => `${t.ddd}${t.numero}`).join(', ')
                                                    : ''}
                                            </p>
                                        </div>
                                        {clienteSelecionado?.id === cliente.id && (
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Paginação */}
                        {!buscando && !buscaVazia && totalPages > 1 && !clienteSelecionado && (
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                                        Anterior
                                    </Button>
                                    <span className="mx-2 text-sm">Página {page} de {totalPages}</span>
                                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
                                        Próxima
                                    </Button>
                                </div>
                                <div>
                                    <label className="text-sm mr-2">Itens por página:</label>
                                    <select value={size} onChange={handleSizeChange} className="border rounded px-2 py-1 text-sm">
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                        )}
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
