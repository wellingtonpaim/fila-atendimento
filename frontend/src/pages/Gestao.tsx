import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, UserPlus, Monitor } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

// Services
import { filaService } from '@/services/filaService';
import { setorService } from '@/services/setorService';
import { unidadeService } from '@/services/unidadeService';
import { usuarioService } from '@/services/usuarioService';
import { clienteService } from '@/services/clienteService';
import { painelService } from '@/services/painelService'; // Importado
import { useAuth } from '@/contexts/AuthContext';

// Types
import {
    FilaCreateDTO, FilaResponseDTO, SetorCreateDTO, SetorResponseDTO,
    UnidadeAtendimentoCreateDTO, UnidadeAtendimentoResponseDTO,
    UsuarioCreateDTO, UsuarioResponseDTO, CategoriaUsuario,
    TipoTelefone, Telefone, ClienteCreateDTO, ClienteResponseDTO, Endereco,
    PainelCreateDTO, PainelResponseDTO
} from '@/types';

interface FormErrors { [key: string]: string }
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';
interface PaginationMeta { totalCount: number; totalPages: number; page: number; pageSize: number; }
type SortState = { field: string; dir: 'asc' | 'desc' };

const formatCepMask = (value: string): string => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d)/, '$1-$2');
};

const Gestao = () => {
    const { toast } = useToast();
    const { selectedUnitId } = useAuth();

    const [activeTab, setActiveTab] = useState<string>(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('gestao_active_tab') : null;
        const allowed = new Set(['filas', 'setores', 'unidades', 'usuarios', 'clientes', 'paineis']);
        return saved && allowed.has(saved) ? saved : 'filas';
    });
    useEffect(() => { try { localStorage.setItem('gestao_active_tab', activeTab); } catch { } }, [activeTab]);

    // ===== Dados =====
    const [filas, setFilas] = useState<FilaResponseDTO[]>([]);
    const [setores, setSetores] = useState<SetorResponseDTO[]>([]);
    const [unidades, setUnidades] = useState<UnidadeAtendimentoResponseDTO[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);
    const [paineis, setPaineis] = useState<PainelResponseDTO[]>([]); // Novo

    const [loading, setLoading] = useState(false);

    // ===== Modais e Edição =====
    const [modalOpen, setModalOpen] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});

    // Formulários (mantido para compatibilidade com a lógica existente)
    const [filaForm, setFilaForm] = useState<FilaCreateDTO>({ nome: '', setorId: '', unidadeAtendimentoId: '' });
    const [setorForm, setSetorForm] = useState<SetorCreateDTO>({ nome: '' });
    const [unidadeForm, setUnidadeForm] = useState<UnidadeAtendimentoCreateDTO>({ nome: '', endereco: { logradouro: '', numero: '' }, telefones: [] });
    const [usuarioForm, setUsuarioForm] = useState<UsuarioCreateDTO>({ nomeUsuario: '', email: '', senha: '', categoria: CategoriaUsuario.USUARIO, unidadesIds: [] });
    const [clienteForm, setClienteForm] = useState<ClienteCreateDTO>({ cpf: '', nome: '' });

    const [errors, setErrors] = useState<FormErrors>({});

    // Opções para Selects
    const [unidadeOptions, setUnidadeOptions] = useState<UnidadeAtendimentoResponseDTO[]>([]);
    const [setorOptions, setSetorOptions] = useState<SetorResponseDTO[]>([]);
    const [filaOptions, setFilaOptions] = useState<FilaResponseDTO[]>([]); // Para modal de painel

    // ===== Carregamento de Dados =====
    const loadInitialData = async () => {
        setLoading(true);
        try {
            if (!selectedUnitId) {
                toast({ title: "Aviso", description: "Selecione uma unidade para gerenciar.", variant: "default" });
                return;
            };

            const [filasRes, setoresRes, unidadesRes, usuariosRes, clientesRes, paineisRes] = await Promise.all([
                filaService.listarPorUnidade(selectedUnitId),
                setorService.listarTodos(),
                unidadeService.listarTodas(),
                usuarioService.listarTodos(),
                clienteService.listarTodos(),
                painelService.listarPorUnidade(selectedUnitId)
            ]);

            setFilas(filasRes.data || []);
            setFilaOptions(filasRes.data || []);
            setSetores(setoresRes.data || []);
            setSetorOptions(setoresRes.data || []);
            setUnidades(unidadesRes.data || []);
            setUnidadeOptions(unidadesRes.data || []);
            setUsuarios(usuariosRes.data || []);
            setClientes(clientesRes.data || []);
            setPaineis(paineisRes.data || []);

        } catch (err: any) {
            toast({ title: 'Erro', description: `Falha ao carregar dados: ${err.message}`, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, [selectedUnitId]);

    // ===== Handlers de Ação =====
    const handleOpenModal = (type: string, item: any | null = null) => {
        setEditingItem(item);
        setErrors({});
        const defaultUnitId = selectedUnitId || '';

        let initialData = {};
        switch (type) {
            case 'fila': initialData = item ? { nome: item.nome, setorId: item.setor.id, unidadeAtendimentoId: item.unidade.id } : { nome: '', setorId: '', unidadeAtendimentoId: defaultUnitId }; break;
            case 'setor': initialData = item ? { nome: item.nome } : { nome: '' }; break;
            case 'unidade': initialData = item ? { nome: item.nome, endereco: item.endereco || {}, telefones: item.telefones || [] } : { nome: '', endereco: {}, telefones: [] }; break;
            case 'usuario': initialData = item ? { nomeUsuario: item.nomeUsuario, email: item.email, senha: '', categoria: item.categoria, unidadesIds: item.unidadesIds || [] } : { nomeUsuario: '', email: '', senha: '', categoria: CategoriaUsuario.USUARIO, unidadesIds: [] }; break;
            case 'cliente': initialData = item ? { ...item } : { cpf: '', nome: '', email: '', telefones: [], endereco: {} }; break;
            case 'painel': initialData = item ? { descricao: item.descricao, filasIds: item.filasIds || [] } : { descricao: '', unidadeAtendimentoId: defaultUnitId, filasIds: [] }; break;
        }
        setFormData(initialData);
        setModalOpen(type);
    };

    const handleSave = async () => {
        if (!modalOpen || !selectedUnitId) return;
        setLoading(true);
        try {
            let response;
            switch (modalOpen) {
                case 'fila':
                    if (editingItem) response = await filaService.atualizarParcialmente(editingItem.id, formData);
                    else response = await filaService.criar({ ...formData, unidadeAtendimentoId: selectedUnitId });
                    break;
                case 'setor':
                    if (editingItem) response = await setorService.substituir(editingItem.id, formData);
                    else response = await setorService.criar(formData);
                    break;
                case 'unidade':
                    if (editingItem) response = await unidadeService.atualizarParcialmente(editingItem.id, formData);
                    else response = await unidadeService.criar(formData);
                    break;
                case 'usuario':
                    if (editingItem) response = await usuarioService.atualizarParcialmente(editingItem.id, formData);
                    else response = await usuarioService.criar(formData);
                    break;
                case 'cliente':
                    if (editingItem) response = await clienteService.atualizarParcialmente(editingItem.id, formData);
                    else response = await clienteService.criar(formData);
                    break;
                case 'painel':
                    const payload = { ...formData, unidadeAtendimentoId: selectedUnitId };
                    if (editingItem) response = await painelService.atualizar(editingItem.id, payload);
                    else response = await painelService.criar(payload);
                    break;
            }
            toast({ title: "Sucesso", description: `Item ${editingItem ? 'atualizado' : 'criado'} com sucesso.` });
            setModalOpen(null);
            loadInitialData();
        } catch (err: any) {
            toast({ title: "Erro", description: err.message || 'Falha ao salvar o item.', variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        setLoading(true);
        try {
            switch(type) {
                case 'fila': await filaService.desativar(id); break;
                case 'setor': await setorService.desativar(id); break;
                case 'unidade': await unidadeService.desativar(id); break;
                case 'usuario': await usuarioService.desativar(id); break;
                case 'cliente': await clienteService.desativar(id); break;
                case 'painel': await painelService.desativar(id); break;
            }
            toast({ title: "Sucesso", description: "Item excluído com sucesso." });
            loadInitialData();
        } catch (err: any) {
            toast({ title: "Erro", description: err.message || 'Falha ao excluir o item.', variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFilaCheckboxChange = (filaId: string, checked: boolean) => {
        setFormData((prev: any) => {
            const currentFilas = prev.filasIds || [];
            if (checked) {
                return { ...prev, filasIds: [...currentFilas, filaId] };
            } else {
                return { ...prev, filasIds: currentFilas.filter((id: string) => id !== filaId) };
            }
        });
    };

    const renderFilaNames = (filaIds: string[]) => {
        if (!filaIds || filaIds.length === 0) return <Badge variant="secondary">Nenhuma</Badge>;
        return (
            <div className="flex flex-wrap gap-1">
                {filaIds.map(id => {
                    const fila = filaOptions.find(f => f.id === id);
                    return <Badge key={id} variant="outline">{fila?.nome || 'Desconhecida'}</Badge>;
                })}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Gestão do Sistema</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="filas">Filas</TabsTrigger>
                    <TabsTrigger value="setores">Setores</TabsTrigger>
                    <TabsTrigger value="unidades">Unidades</TabsTrigger>
                    <TabsTrigger value="usuarios">Usuários</TabsTrigger>
                    <TabsTrigger value="clientes">Clientes</TabsTrigger>
                    <TabsTrigger value="paineis">Painéis</TabsTrigger>
                </TabsList>

                {/* Mantenha suas abas existentes aqui, elas não precisam de alteração */}

                {/* TAB FILAS (exemplo de como ficaria) */}
                <TabsContent value="filas">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gerenciar Filas</CardTitle>
                                <CardDescription>Adicione, edite e remova as filas de atendimento.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenModal('fila')}><Plus className="w-4 h-4 mr-2" /> Nova Fila</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filas.map(fila => (
                                        <TableRow key={fila.id}>
                                            <TableCell>{fila.nome}</TableCell>
                                            <TableCell>{fila.setor.nome}</TableCell>
                                            <TableCell>{fila.unidade.nome}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal('fila', fila)}><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete('fila', fila.id)}><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* ... outras abas */}

                {/* NOVA TAB PAINÉIS */}
                <TabsContent value="paineis">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gerenciar Painéis</CardTitle>
                                <CardDescription>Crie e configure os painéis de exibição pública.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenModal('painel')}>
                                <Plus className="w-4 h-4 mr-2" /> Novo Painel
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Filas Vinculadas</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paineis.map(painel => (
                                        <TableRow key={painel.id}>
                                            <TableCell className="font-medium">{painel.descricao}</TableCell>
                                            <TableCell>{renderFilaNames(painel.filasIds)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal('painel', painel)}><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete('painel', painel.id)}><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* MODAL PARA PAINEL */}
            <Dialog open={modalOpen === 'painel'} onOpenChange={() => setModalOpen(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Painel' : 'Novo Painel'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Altere a descrição e as filas associadas.' : 'Crie um novo painel para exibição pública.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="painel-descricao">Descrição do Painel *</Label>
                            <Input
                                id="painel-descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Ex: Painel da Recepção Principal"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Filas a Exibir neste Painel</Label>
                            <ScrollArea className="h-48 rounded-md border p-4">
                                <div className="space-y-2">
                                    {filaOptions.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fila encontrada nesta unidade.</p>
                                    )}
                                    {filaOptions.map(fila => (
                                        <div key={fila.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`fila-checkbox-${fila.id}`}
                                                checked={formData.filasIds?.includes(fila.id)}
                                                onCheckedChange={(checked) => handleFilaCheckboxChange(fila.id, !!checked)}
                                            />
                                            <Label htmlFor={`fila-checkbox-${fila.id}`} className="cursor-pointer">{fila.nome}</Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Aqui você manteria os outros modais (Fila, Setor, etc.) */}

        </div>
    );
}

export default Gestao;