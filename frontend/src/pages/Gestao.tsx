import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Building2,
    Users,
    Settings,
    Edit,
    Trash2,
    Eye,
    Loader2,
    UserPlus,
    MapPin,
    Phone,
    Mail,
    Calendar
} from "lucide-react";

// Importar serviços
import { unidadeService } from "@/services/unidadeService";
import { setorService } from "@/services/setorService";
import { usuarioService } from "@/services/usuarioService";
import { authService } from "@/services/authService";
import { clienteService } from "@/services/clienteService";
import { filaService } from "@/services/filaService";

// Importar tipos
import {
    UnidadeAtendimentoResponseDTO,
    UnidadeAtendimentoCreateDTO,
    SetorResponseDTO,
    SetorCreateDTO,
    UsuarioResponseDTO,
    UsuarioCreateDTO,
    ClienteResponseDTO,
    ClienteCreateDTO,
    FilaResponseDTO,
    FilaCreateDTO
} from "@/types";

interface GestaoStats {
    totalUnidades: number;
    totalSetores: number;
    totalUsuarios: number;
    totalClientes: number;
    totalFilas: number;
}

const Gestao = () => {
    // Estados
    const [stats, setStats] = useState<GestaoStats>({ totalUnidades: 0, totalSetores: 0, totalUsuarios: 0, totalClientes: 0, totalFilas: 0 });
    const [unidades, setUnidades] = useState<UnidadeAtendimentoResponseDTO[]>([]);
    const [setores, setSetores] = useState<SetorResponseDTO[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);
    const [filas, setFilas] = useState<FilaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'unidades' | 'setores' | 'usuarios' | 'clientes' | 'filas'>('unidades');

    // Estados para modais
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [showSetorModal, setShowSetorModal] = useState(false);
    const [showUsuarioModal, setShowUsuarioModal] = useState(false);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showFilaModal, setShowFilaModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Estados para formulários
    const [unidadeForm, setUnidadeForm] = useState<UnidadeAtendimentoCreateDTO>({ nome: '' });
    const [setorForm, setSetorForm] = useState<SetorCreateDTO>({ nome: '' });
    const [usuarioForm, setUsuarioForm] = useState<UsuarioCreateDTO>({
        nomeUsuario: '',
        email: '',
        senha: '',
        categoria: 'USUARIO'
    });
    const [clienteForm, setClienteForm] = useState<ClienteCreateDTO>({
        cpf: '',
        nome: '',
        email: ''
    });
    const [filaForm, setFilaForm] = useState<FilaCreateDTO>({
        nome: '',
        setorId: '',
        unidadeAtendimentoId: ''
    });

    const { toast } = useToast();
    const currentUser = authService.getUsuario();

    // Carregar dados iniciais
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Carregar dados básicos primeiro
            const [unidadesData, setoresData, usuariosData, clientesData] = await Promise.all([
                unidadeService.listarTodas(),
                setorService.listarTodos(),
                usuarioService.listarTodos(),
                clienteService.listarTodos()
            ]);

            // Para filas, precisamos buscar por unidade (vamos pegar da primeira unidade por enquanto)
            let filasData: FilaResponseDTO[] = [];
            if (unidadesData.length > 0) {
                // Buscar filas de todas as unidades
                const filasPromises = unidadesData.map(unidade =>
                    filaService.listarPorUnidade(unidade.id)
                );
                const filasArrays = await Promise.all(filasPromises);
                filasData = filasArrays.flat(); // Combinar todas as filas
            }

            setUnidades(unidadesData);
            setSetores(setoresData);
            setUsuarios(usuariosData);
            setClientes(clientesData);
            setFilas(filasData);

            setStats({
                totalUnidades: unidadesData.length,
                totalSetores: setoresData.length,
                totalUsuarios: usuariosData.length,
                totalClientes: clientesData.length,
                totalFilas: filasData.length
            });

            console.log('✅ Dados de gestão carregados');
        } catch (error: any) {
            console.error('❌ Erro ao carregar dados:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: error.message || 'Não foi possível carregar os dados de gestão.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handlers para unidades
    const handleCreateUnidade = async () => {
        try {
            if (!unidadeForm.nome.trim()) {
                toast({
                    title: 'Campo obrigatório',
                    description: 'O nome da unidade é obrigatório.',
                    variant: 'destructive',
                });
                return;
            }

            await unidadeService.criar(unidadeForm);

            toast({
                title: 'Sucesso',
                description: 'Unidade criada com sucesso!',
            });

            setShowUnidadeModal(false);
            setUnidadeForm({ nome: '' });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao criar unidade',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleEditUnidade = (unidade: UnidadeAtendimentoResponseDTO) => {
        setEditingItem(unidade);
        setUnidadeForm({ nome: unidade.nome });
        setShowUnidadeModal(true);
    };

    const handleDeleteUnidade = async (id: string) => {
        try {
            await unidadeService.desativar(id);
            toast({
                title: 'Sucesso',
                description: 'Unidade desativada com sucesso!',
            });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao desativar unidade',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Handlers para setores
    const handleCreateSetor = async () => {
        try {
            if (!setorForm.nome.trim()) {
                toast({
                    title: 'Campo obrigatório',
                    description: 'O nome do setor é obrigatório.',
                    variant: 'destructive',
                });
                return;
            }

            await setorService.criar(setorForm);

            toast({
                title: 'Sucesso',
                description: 'Setor criado com sucesso!',
            });

            setShowSetorModal(false);
            setSetorForm({ nome: '' });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao criar setor',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleEditSetor = (setor: SetorResponseDTO) => {
        setEditingItem(setor);
        setSetorForm({ nome: setor.nome });
        setShowSetorModal(true);
    };

    const handleDeleteSetor = async (id: string) => {
        try {
            await setorService.desativar(id);
            toast({
                title: 'Sucesso',
                description: 'Setor desativado com sucesso!',
            });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao desativar setor',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Handlers para usuários
    const handleCreateUsuario = async () => {
        try {
            if (!usuarioForm.nomeUsuario.trim() || !usuarioForm.email.trim() || !usuarioForm.senha.trim()) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Todos os campos são obrigatórios.',
                    variant: 'destructive',
                });
                return;
            }

            if (editingItem) {
                // Atualizar usuário existente
                const { senha, ...updateData } = usuarioForm;
                await usuarioService.atualizarParcialmente(editingItem.id, updateData);
                toast({
                    title: 'Sucesso',
                    description: 'Usuário atualizado com sucesso!',
                });
            } else {
                // Criar novo usuário
                await usuarioService.criar(usuarioForm);
                toast({
                    title: 'Sucesso',
                    description: 'Usuário criado com sucesso!',
                });
            }

            setShowUsuarioModal(false);
            setUsuarioForm({
                nomeUsuario: '',
                email: '',
                senha: '',
                categoria: 'USUARIO'
            });
            setEditingItem(null);
            loadData();
        } catch (error: any) {
            toast({
                title: editingItem ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleEditUsuario = (usuario: UsuarioResponseDTO) => {
        setEditingItem(usuario);
        setUsuarioForm({
            nomeUsuario: usuario.nomeUsuario,
            email: usuario.email,
            senha: '', // Não preencher senha na edição
            categoria: usuario.categoria
        });
        setShowUsuarioModal(true);
    };

    const handleDeleteUsuario = async (id: string) => {
        try {
            await usuarioService.desativar(id);
            toast({
                title: 'Sucesso',
                description: 'Usuário desativado com sucesso!',
            });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao desativar usuário',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Handlers para clientes
    const handleCreateCliente = async () => {
        try {
            if (!clienteForm.nome.trim() || !clienteForm.email.trim() || !clienteForm.cpf.trim()) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Nome, email e CPF são obrigatórios.',
                    variant: 'destructive',
                });
                return;
            }

            if (editingItem) {
                // Atualizar cliente existente
                await clienteService.atualizarParcialmente(editingItem.id, clienteForm);
                toast({
                    title: 'Sucesso',
                    description: 'Cliente atualizado com sucesso!',
                });
            } else {
                // Criar novo cliente
                await clienteService.criar(clienteForm);
                toast({
                    title: 'Sucesso',
                    description: 'Cliente criado com sucesso!',
                });
            }

            setShowClienteModal(false);
            setClienteForm({ cpf: '', nome: '', email: '' });
            setEditingItem(null);
            loadData();
        } catch (error: any) {
            toast({
                title: editingItem ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleEditCliente = (cliente: ClienteResponseDTO) => {
        setEditingItem(cliente);
        setClienteForm({
            cpf: cliente.cpf,
            nome: cliente.nome,
            email: cliente.email,
        });
        setShowClienteModal(true);
    };

    const handleDeleteCliente = async (id: string) => {
        try {
            await clienteService.desativar(id);
            toast({
                title: 'Sucesso',
                description: 'Cliente desativado com sucesso!',
            });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao desativar cliente',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Handlers para filas
    const handleCreateFila = async () => {
        try {
            if (!filaForm.nome.trim() || !filaForm.setorId || !filaForm.unidadeAtendimentoId) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Nome da fila, setor e unidade são obrigatórios.',
                    variant: 'destructive',
                });
                return;
            }

            if (editingItem) {
                // Atualizar fila existente
                await filaService.atualizarParcialmente(editingItem.id, { nome: filaForm.nome });
                toast({
                    title: 'Sucesso',
                    description: 'Fila atualizada com sucesso!',
                });
            } else {
                // Criar nova fila
                await filaService.criar(filaForm);
                toast({
                    title: 'Sucesso',
                    description: 'Fila criada com sucesso!',
                });
            }

            setShowFilaModal(false);
            setFilaForm({ nome: '', setorId: '', unidadeAtendimentoId: '' });
            setEditingItem(null);
            loadData();
        } catch (error: any) {
            toast({
                title: editingItem ? 'Erro ao atualizar fila' : 'Erro ao criar fila',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleEditFila = (fila: FilaResponseDTO) => {
        setEditingItem(fila);
        setFilaForm({
            nome: fila.nome,
            setorId: fila.setor.id,
            unidadeAtendimentoId: fila.unidade.id
        });
        setShowFilaModal(true);
    };

    const handleDeleteFila = async (id: string) => {
        try {
            await filaService.desativar(id);
            toast({
                title: 'Sucesso',
                description: 'Fila desativada com sucesso!',
            });
            loadData();
        } catch (error: any) {
            toast({
                title: 'Erro ao desativar fila',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleCardClick = (type: 'unidades' | 'setores' | 'usuarios' | 'clientes' | 'filas') => {
        setActiveTab(type);
    };

    const resetModals = () => {
        setEditingItem(null);
        setUnidadeForm({ nome: '' });
        setSetorForm({ nome: '' });
        setUsuarioForm({
            nomeUsuario: '',
            email: '',
            senha: '',
            categoria: 'USUARIO'
        });
        setClienteForm({ cpf: '', nome: '', email: '' });
        setFilaForm({ nome: '', setorId: '', unidadeAtendimentoId: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Carregando dados de gestão">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Carregando dados de gestão...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="main" aria-label="Página de gestão">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão</h1>
                    <p className="text-muted-foreground">
                        Administre unidades, setores e usuários do sistema
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button aria-label="Adicionar novo item">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Selecione o que deseja adicionar</DialogTitle>
                            <DialogDescription>
                                Escolha o tipo de item que você gostaria de criar.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Button
                                onClick={() => {
                                    resetModals();
                                    setShowUnidadeModal(true);
                                }}
                                className="justify-start"
                            >
                                <Building2 className="mr-2 h-4 w-4" />
                                Nova Unidade
                            </Button>
                            <Button
                                onClick={() => {
                                    resetModals();
                                    setShowSetorModal(true);
                                }}
                                className="justify-start"
                                variant="outline"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Novo Setor
                            </Button>
                            <Button
                                onClick={() => {
                                    resetModals();
                                    setShowUsuarioModal(true);
                                }}
                                className="justify-start"
                                variant="outline"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Novo Usuário
                            </Button>
                            <Button
                                onClick={() => {
                                    resetModals();
                                    setShowClienteModal(true);
                                }}
                                className="justify-start"
                                variant="outline"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Novo Cliente
                            </Button>
                            <Button
                                onClick={() => {
                                    resetModals();
                                    setShowFilaModal(true);
                                }}
                                className="justify-start"
                                variant="outline"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Nova Fila
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick('unidades')}
                    role="button"
                    aria-label={`Ver detalhes das ${stats.totalUnidades} unidades cadastradas`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCardClick('unidades')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Unidades
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUnidades}</div>
                        <p className="text-xs text-muted-foreground">
                            unidades cadastradas
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick('setores')}
                    role="button"
                    aria-label={`Ver detalhes dos ${stats.totalSetores} setores ativos`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCardClick('setores')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Setores
                        </CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSetores}</div>
                        <p className="text-xs text-muted-foreground">
                            setores ativos
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick('usuarios')}
                    role="button"
                    aria-label={`Ver detalhes dos ${stats.totalUsuarios} usuários cadastrados`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCardClick('usuarios')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Usuários
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                        <p className="text-xs text-muted-foreground">
                            usuários cadastrados
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick('clientes')}
                    role="button"
                    aria-label={`Ver detalhes dos ${stats.totalClientes} clientes cadastrados`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCardClick('clientes')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clientes
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClientes}</div>
                        <p className="text-xs text-muted-foreground">
                            clientes cadastrados
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick('filas')}
                    role="button"
                    aria-label={`Ver detalhes das ${stats.totalFilas} filas cadastradas`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCardClick('filas')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Filas
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFilas}</div>
                        <p className="text-xs text-muted-foreground">
                            filas cadastradas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Área de Gerenciamento Dinâmica */}
            <div className="space-y-6">
                {/* Navegação por Abas */}
                <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                    <Button
                        variant={activeTab === 'unidades' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('unidades')}
                        aria-pressed={activeTab === 'unidades'}
                    >
                        <Building2 className="mr-2 h-4 w-4" />
                        Unidades
                    </Button>
                    <Button
                        variant={activeTab === 'setores' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('setores')}
                        aria-pressed={activeTab === 'setores'}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Setores
                    </Button>
                    <Button
                        variant={activeTab === 'usuarios' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('usuarios')}
                        aria-pressed={activeTab === 'usuarios'}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Usuários
                    </Button>
                    <Button
                        variant={activeTab === 'clientes' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('clientes')}
                        aria-pressed={activeTab === 'clientes'}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Clientes
                    </Button>
                    <Button
                        variant={activeTab === 'filas' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('filas')}
                        aria-pressed={activeTab === 'filas'}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Filas
                    </Button>
                </div>

                {/* Conteúdo das Abas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {activeTab === 'unidades' && <Building2 className="h-5 w-5" />}
                            {activeTab === 'setores' && <Settings className="h-5 w-5" />}
                            {activeTab === 'usuarios' && <Users className="h-5 w-5" />}
                            {activeTab === 'clientes' && <Users className="h-5 w-5" />}
                            {activeTab === 'filas' && <Users className="h-5 w-5" />}
                            Gerenciar {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </CardTitle>
                        <CardDescription>
                            {activeTab === 'unidades' && 'Cadastre e gerencie unidades de atendimento'}
                            {activeTab === 'setores' && 'Configure setores e tipos de atendimento'}
                            {activeTab === 'usuarios' && 'Administre usuários e suas permissões'}
                            {activeTab === 'clientes' && 'Gerencie os clientes do sistema'}
                            {activeTab === 'filas' && 'Administre as filas de atendimento'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Tabela de Unidades */}
                        {activeTab === 'unidades' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {unidades.length} unidade(s) encontrada(s)
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            resetModals();
                                            setShowUnidadeModal(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nova Unidade
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {unidades.map((unidade) => (
                                            <TableRow key={unidade.id}>
                                                <TableCell className="font-medium">{unidade.nome}</TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {unidade.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditUnidade(unidade)}
                                                            aria-label={`Editar unidade ${unidade.nome}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteUnidade(unidade.id)}
                                                            aria-label={`Desativar unidade ${unidade.nome}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Tabela de Setores */}
                        {activeTab === 'setores' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {setores.length} setor(es) encontrado(s)
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            resetModals();
                                            setShowSetorModal(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Setor
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {setores.map((setor) => (
                                            <TableRow key={setor.id}>
                                                <TableCell className="font-medium">{setor.nome}</TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {setor.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditSetor(setor)}
                                                            aria-label={`Editar setor ${setor.nome}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteSetor(setor.id)}
                                                            aria-label={`Desativar setor ${setor.nome}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Tabela de Usuários */}
                        {activeTab === 'usuarios' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {usuarios.length} usuário(s) encontrado(s)
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            resetModals();
                                            setShowUsuarioModal(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Usuário
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usuarios.map((usuario) => (
                                            <TableRow key={usuario.id}>
                                                <TableCell className="font-medium">{usuario.nomeUsuario}</TableCell>
                                                <TableCell>{usuario.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={usuario.categoria === 'ADMINISTRADOR' ? 'default' : 'secondary'}>
                                                        {usuario.categoria}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditUsuario(usuario)}
                                                            aria-label={`Editar usuário ${usuario.nomeUsuario}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteUsuario(usuario.id)}
                                                            aria-label={`Desativar usuário ${usuario.nomeUsuario}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Tabela de Clientes */}
                        {activeTab === 'clientes' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {clientes.length} cliente(s) encontrado(s)
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            resetModals();
                                            setShowClienteModal(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Cliente
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Telefone</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientes.map((cliente) => (
                                            <TableRow key={cliente.id}>
                                                <TableCell className="font-medium">{cliente.nome}</TableCell>
                                                <TableCell>{cliente.email}</TableCell>
                                                <TableCell>{cliente.telefone}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditCliente(cliente)}
                                                            aria-label={`Editar cliente ${cliente.nome}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteCliente(cliente.id)}
                                                            aria-label={`Desativar cliente ${cliente.nome}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Tabela de Filas */}
                        {activeTab === 'filas' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {filas.length} fila(s) encontrada(s)
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            resetModals();
                                            setShowFilaModal(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nova Fila
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filas.map((fila) => (
                                            <TableRow key={fila.id}>
                                                <TableCell className="font-medium">{fila.nome}</TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {fila.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditFila(fila)}
                                                            aria-label={`Editar fila ${fila.nome}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteFila(fila.id)}
                                                            aria-label={`Desativar fila ${fila.nome}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Unidade */}
            <Dialog open={showUnidadeModal} onOpenChange={setShowUnidadeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Editar Unidade' : 'Nova Unidade'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Edite as informações da unidade.' : 'Preencha as informações da nova unidade.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="unidade-nome">Nome da Unidade</Label>
                            <Input
                                id="unidade-nome"
                                value={unidadeForm.nome}
                                onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })}
                                placeholder="Digite o nome da unidade"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowUnidadeModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateUnidade}>
                            {editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Setor */}
            <Dialog open={showSetorModal} onOpenChange={setShowSetorModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Editar Setor' : 'Novo Setor'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Edite as informações do setor.' : 'Preencha as informações do novo setor.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="setor-nome">Nome do Setor</Label>
                            <Input
                                id="setor-nome"
                                value={setorForm.nome}
                                onChange={(e) => setSetorForm({ ...setorForm, nome: e.target.value })}
                                placeholder="Digite o nome do setor"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowSetorModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateSetor}>
                            {editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Usuário */}
            <Dialog open={showUsuarioModal} onOpenChange={setShowUsuarioModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Editar Usuário' : 'Novo Usuário'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Edite as informações do usuário.' : 'Preencha as informações do novo usuário.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="usuario-nome">Nome do Usuário</Label>
                            <Input
                                id="usuario-nome"
                                value={usuarioForm.nomeUsuario}
                                onChange={(e) => setUsuarioForm({ ...usuarioForm, nomeUsuario: e.target.value })}
                                placeholder="Digite o nome do usuário"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="usuario-email">Email</Label>
                            <Input
                                id="usuario-email"
                                type="email"
                                value={usuarioForm.email}
                                onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
                                placeholder="Digite o email do usuário"
                            />
                        </div>
                        {!editingItem && (
                            <div className="space-y-2">
                                <Label htmlFor="usuario-senha">Senha</Label>
                                <Input
                                    id="usuario-senha"
                                    type="password"
                                    value={usuarioForm.senha}
                                    onChange={(e) => setUsuarioForm({ ...usuarioForm, senha: e.target.value })}
                                    placeholder="Digite a senha do usuário"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowUsuarioModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateUsuario}>
                            {editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Cliente */}
            <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Editar Cliente' : 'Novo Cliente'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Edite as informações do cliente.' : 'Preencha as informações do novo cliente.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cliente-nome">Nome do Cliente</Label>
                            <Input
                                id="cliente-nome"
                                value={clienteForm.nome}
                                onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                                placeholder="Digite o nome do cliente"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cliente-email">Email</Label>
                            <Input
                                id="cliente-email"
                                type="email"
                                value={clienteForm.email}
                                onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                                placeholder="Digite o email do cliente"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cliente-telefone">Telefone</Label>
                            <Input
                                id="cliente-telefone"
                                value={clienteForm.telefone}
                                onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })}
                                placeholder="Digite o telefone do cliente"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowClienteModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateCliente}>
                            {editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Fila */}
            <Dialog open={showFilaModal} onOpenChange={setShowFilaModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Editar Fila' : 'Nova Fila'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Edite as informações da fila.' : 'Preencha as informações da nova fila.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fila-nome">Nome da Fila</Label>
                            <Input
                                id="fila-nome"
                                value={filaForm.nome}
                                onChange={(e) => setFilaForm({ ...filaForm, nome: e.target.value })}
                                placeholder="Digite o nome da fila"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fila-setor">Setor</Label>
                            <Select
                                id="fila-setor"
                                value={filaForm.setorId}
                                onValueChange={(value) => setFilaForm({ ...filaForm, setorId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o setor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {setores.map((setor) => (
                                        <SelectItem key={setor.id} value={setor.id}>
                                            {setor.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fila-unidade">Unidade de Atendimento</Label>
                            <Select
                                id="fila-unidade"
                                value={filaForm.unidadeAtendimentoId}
                                onValueChange={(value) => setFilaForm({ ...filaForm, unidadeAtendimentoId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unidades.map((unidade) => (
                                        <SelectItem key={unidade.id} value={unidade.id}>
                                            {unidade.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowFilaModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateFila}>
                            {editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Gestao;
