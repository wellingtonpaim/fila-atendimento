import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
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
    FilaResponseDTO, SetorResponseDTO,
    UnidadeAtendimentoResponseDTO,
    UsuarioResponseDTO, CategoriaUsuario,
    ClienteResponseDTO,
    PainelResponseDTO, UF
} from '@/types';

interface FormErrors { [key: string]: string }

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

    // Opções para Selects
    const [unidadeOptions, setUnidadeOptions] = useState<UnidadeAtendimentoResponseDTO[]>([]);
    const [setorOptions, setSetorOptions] = useState<SetorResponseDTO[]>([]);
    const [filaOptions, setFilaOptions] = useState<FilaResponseDTO[]>([]); // Para modal de painel

    // ===== Estado de busca/paginação por aba =====
    // Unidades
    const [uniQuery, setUniQuery] = useState('');
    const [uniMode, setUniMode] = useState<'todas' | 'nome'>('todas');
    const [uniPage, setUniPage] = useState(0);
    const [uniSize, setUniSize] = useState(10);
    const [uniMeta, setUniMeta] = useState<any | null>(null);
    const [uniLoading, setUniLoading] = useState(false);

    // Setores
    const [setQuery, setSetQuery] = useState('');
    const [setMode, setSetMode] = useState<'todas' | 'nome'>('todas');
    const [setPage, setSetPage] = useState(0);
    const [setSize, setSetSize] = useState(10);
    const [setMeta, setSetMeta] = useState<any | null>(null);
    const [setoresLoading, setSetoresLoading] = useState(false);

    // Usuários
    const [usrQuery, setUsrQuery] = useState('');
    const [usrMode, setUsrMode] = useState<'todas' | 'email'>('todas');
    const [usrPage, setUsrPage] = useState(0);
    const [usrSize, setUsrSize] = useState(10);
    const [usrMeta, setUsrMeta] = useState<any | null>(null);
    const [usrLoading, setUsrLoading] = useState(false);

    // Clientes
    const [cliQuery, setCliQuery] = useState('');
    const [cliMode, setCliMode] = useState<'todas' | 'nome' | 'email' | 'telefone' | 'cpf'>('todas');
    const [cliPage, setCliPage] = useState(0);
    const [cliSize, setCliSize] = useState(10);
    const [cliMeta, setCliMeta] = useState<any | null>(null);
    const [cliLoading, setCliLoading] = useState(false);

    // Filas
    const [filaQuery, setFilaQuery] = useState('');
    const [filaMode, setFilaMode] = useState<'todas' | 'porUnidade'>('todas'); // default agora 'todas'
    const [filaPage, setFilaPage] = useState(0);
    const [filaSize, setFilaSize] = useState(10);
    const [filaMetaState, setFilaMetaState] = useState<any | null>(null);
    const [filaLoading, setFilaLoading] = useState(false);
    const [filaUnidadeFilter, setFilaUnidadeFilter] = useState<string | ''>('');

    // Painéis
    const [painelPage, setPainelPage] = useState(0);
    const [painelSize, setPainelSize] = useState(10);
    const [painelMeta, setPainelMeta] = useState<any | null>(null);
    const [painelLoading, setPainelLoading] = useState(false);
    const [painelUnidadeFilter, setPainelUnidadeFilter] = useState<string | ''>('');

    // Carregar opções iniciais (unidades, setores) e filas por unidade selecionada
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [unidadesRes, setoresRes] = await Promise.all([
                    unidadeService.listarTodas(),
                    setorService.listarTodos()
                ]);
                setUnidadeOptions(unidadesRes?.data || []);
                setSetorOptions(setoresRes?.data || []);
            } catch (e: any) {
                toast({ title: 'Erro', description: e.message || 'Falha ao carregar opções.', variant: 'destructive' });
            }
        };
        loadOptions();
    }, [toast]);

    useEffect(() => {
        const loadFilasDaUnidade = async () => {
            try {
                if (selectedUnitId) {
                    const res = await filaService.listarPorUnidade(selectedUnitId);
                    setFilaOptions(res?.data || []);
                } else {
                    setFilaOptions([]);
                }
            } catch (e: any) {
                toast({ title: 'Erro', description: e.message || 'Falha ao carregar filas da unidade.', variant: 'destructive' });
            }
        };
        loadFilasDaUnidade();
    }, [selectedUnitId, toast]);

    // Carregar dados da aba ativa quando trocar de aba ou quando filtros relevantes mudarem
    useEffect(() => {
        const loadActiveTab = async () => {
            try {
                if (activeTab === 'unidades') {
                    await searchUnidades(0);
                } else if (activeTab === 'setores') {
                    await searchSetores(0);
                } else if (activeTab === 'usuarios') {
                    await searchUsuarios(0);
                } else if (activeTab === 'clientes') {
                    await searchClientes(0);
                } else if (activeTab === 'filas') {
                    // sempre buscar conforme modo atual; default agora é 'todas'
                    await searchFilas(0);
                } else if (activeTab === 'paineis') {
                    // se já houver filtro de unidade, busca; senão tenta usar a primeira unidade disponível
                    if (painelUnidadeFilter) {
                        await searchPaineis(0);
                    } else if (unidadeOptions.length > 0) {
                        setPainelUnidadeFilter(unidadeOptions[0].id);
                    }
                }
            } catch (e) {
                // searchX já exibem toast; silencioso aqui
            }
        };
        loadActiveTab();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Ao carregar opções de unidades e se estiver na aba painéis, definir a primeira unidade por padrão
    useEffect(() => {
        if (activeTab === 'paineis' && !painelUnidadeFilter && unidadeOptions.length > 0) {
            setPainelUnidadeFilter(unidadeOptions[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unidadeOptions]);

    // Reagir à troca de filtros de unidade em Filas e Painéis
    useEffect(() => {
        if (activeTab === 'filas') {
            searchFilas(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filaUnidadeFilter, filaMode]);

    useEffect(() => {
        if (activeTab === 'paineis' && painelUnidadeFilter) {
            searchPaineis(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [painelUnidadeFilter]);

    // ===== Funções de busca/paginação =====
    const searchUnidades = async (page = uniPage) => {
        setUniLoading(true);
        try {
            if (uniMode === 'todas') {
                const { data, meta } = await unidadeService.listarTodasPaginado(page, uniSize);
                setUnidades(data); setUniMeta(meta); setUniPage(page);
            } else {
                const { data, meta } = await unidadeService.buscarPorNomePaginado(uniQuery, page, uniSize);
                setUnidades(data); setUniMeta(meta); setUniPage(page);
            }
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        } finally {
            setUniLoading(false);
        }
    };

    const searchSetores = async (page = setPage) => {
        setSetoresLoading(true);
        try {
            if (setMode === 'todas') {
                const { data, meta } = await setorService.listarTodosPaginado(page, setSize);
                setSetores(data); setSetMeta(meta); setSetPage(page);
            } else {
                const { data, meta } = await setorService.buscarPorNomePaginado(setQuery, page, setSize);
                setSetores(data); setSetMeta(meta); setSetPage(page);
            }
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        } finally {
            setSetoresLoading(false);
        }
    };

    const searchUsuarios = async (page = usrPage) => {
        setUsrLoading(true);
        try {
            if (usrMode === 'todas') {
                const { data, meta } = await usuarioService.listarTodosPaginado(page, usrSize);
                setUsuarios(data); setUsrMeta(meta); setUsrPage(page);
            } else {
                const res = await usuarioService.buscarPorEmail(usrQuery);
                const list = res?.data ? [res.data] : [];
                setUsuarios(list); setUsrMeta(null); setUsrPage(0);
            }
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        } finally {
            setUsrLoading(false);
        }
    };

    const searchClientes = async (page = cliPage) => {
        setCliLoading(true);
        try {
            const q = (cliQuery ?? '').trim();
            if (cliMode === 'todas') {
                const { data, meta } = await clienteService.listarTodosPaginado(page, cliSize);
                setClientes(data); setCliMeta(meta); setCliPage(page);
            } else if (cliMode === 'nome') {
                if (q === '') { setClientes([]); setCliMeta(null); setCliPage(0); return; }
                const { data, meta } = await clienteService.buscarPorNomePaginado(q, page, cliSize);
                setClientes(data); setCliMeta(meta); setCliPage(page);
            } else if (cliMode === 'email') {
                if (q === '') { setClientes([]); setCliMeta(null); setCliPage(0); return; }
                const { data, meta } = await clienteService.buscarPorEmailPaginado(q, page, cliSize);
                setClientes(data); setCliMeta(meta); setCliPage(page);
            } else if (cliMode === 'telefone') {
                if (q === '') { setClientes([]); setCliMeta(null); setCliPage(0); return; }
                const { data, meta } = await clienteService.buscarPorTelefonePaginado(q, page, cliSize);
                setClientes(data); setCliMeta(meta); setCliPage(page);
            } else if (cliMode === 'cpf') {
                if (q === '') { setClientes([]); setCliMeta(null); setCliPage(0); return; }
                const item = await clienteService.buscarPorCpf(q);
                setClientes(item ? [item] : []); setCliMeta(null); setCliPage(0);
            }
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        } finally {
            setCliLoading(false);
        }
    };

    const searchFilas = async (page = filaPage) => {
        setFilaLoading(true);
        try {
            if (filaMode === 'todas') {
                const { data, meta } = await filaService.listarTodasPaginado(page, filaSize);
                setFilas(data); setFilaMetaState(meta); setFilaPage(page);
            } else {
                const unidadeId = filaUnidadeFilter || selectedUnitId;
                if (!unidadeId) throw new Error('Selecione uma unidade.');
                const { data, meta } = await filaService.listarPorUnidadePaginado(unidadeId, page, filaSize);
                setFilas(data); setFilaMetaState(meta); setFilaPage(page);
            }
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        } finally {
            setFilaLoading(false);
        }
    };

    const searchPaineis = async (page = painelPage) => {
        setPainelLoading(true);
        try {
            const unidadeId = painelUnidadeFilter || selectedUnitId;
            if (!unidadeId) throw new Error('Selecione uma unidade.');
            const res = await painelService.listarPorUnidadePaginado(unidadeId, page, painelSize);
            if (!res.success) throw new Error(res.message);
            setPaineis(res.data || []);
            setPainelMeta(null); // evitar paginação imprecisa; API não retorna headers aqui
            setPainelPage(page);
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message, variant: 'destructive' });
        } finally {
            setPainelLoading(false);
        }
    };

    // ===== Helpers de formatação =====
    const formatPhones = (telefones?: Array<{ ddd?: number; numero?: number }>) => {
        if (!Array.isArray(telefones) || telefones.length === 0) return '—';
        return telefones
            .filter((t) => t && t.ddd !== undefined && t.numero !== undefined)
            .map((t) => `${t.ddd}-${t.numero}`)
            .join(', ');
    };

    const formatAddress = (endereco?: { enderecoFormatado?: string; logradouro?: string; numero?: string }) => {
        if (!endereco) return '—';
        if (endereco.enderecoFormatado && endereco.enderecoFormatado.trim() !== '') return endereco.enderecoFormatado;
        const log = endereco.logradouro || '';
        const num = endereco.numero || '';
        const base = `${log} ${num}`.trim();
        return base !== '' ? base : '—';
    };

    // ===== Componentes internos =====
    const PaginationIconNav = ({ meta, onFirst, onPrev, onNext, onLast, inline = false }: any) => {
        if (!meta) return null;
        return (
            <div className={`flex items-center ${inline ? 'justify-end mt-0' : 'justify-end mt-3'} gap-1`}>
                <Button variant="ghost" size="icon" onClick={onFirst} disabled={meta.page <= 0} aria-label="Primeira página"><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onPrev} disabled={meta.page <= 0} aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs text-muted-foreground px-2">Página {meta.page + 1} de {meta.totalPages}</span>
                <Button variant="ghost" size="icon" onClick={onNext} disabled={meta.page >= meta.totalPages - 1} aria-label="Próxima página"><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onLast} disabled={meta.page >= meta.totalPages - 1} aria-label="Última página"><ChevronsRight className="h-4 w-4" /></Button>
            </div>
        );
    };

    const AddressFields = ({ baseKey = 'endereco' }: { baseKey?: string }) => (
        <div className="grid gap-4">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label>CEP</Label>
                    <Input value={formData[baseKey]?.cep || ''} onChange={(e) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], cep: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                    <Label>Logradouro</Label>
                    <Input value={formData[baseKey]?.logradouro || ''} onChange={(e) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], logradouro: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                    <Label>Número</Label>
                    <Input value={formData[baseKey]?.numero || ''} onChange={(e) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], numero: e.target.value } })} />
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label>Complemento</Label>
                    <Input value={formData[baseKey]?.complemento || ''} onChange={(e) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], complemento: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                    <Label>Bairro</Label>
                    <Input value={formData[baseKey]?.bairro || ''} onChange={(e) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], bairro: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                    <Label>Cidade</Label>
                    <Input value={formData[baseKey]?.cidade || ''} onChange={(e) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], cidade: e.target.value } })} />
                </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
                <div className="grid gap-2">
                    <Label>UF</Label>
                    <Select value={formData[baseKey]?.uf || ''} onValueChange={(v) => setFormData({ ...formData, [baseKey]: { ...formData[baseKey], uf: v } })}>
                        <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>
                            {Object.values(UF).map((uf) => (
                                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Campo de Endereço Formatado removido dos formulários conforme requisito */}
            </div>
        </div>
    );

    const PhonesFields = ({ baseKey = 'telefones' }: { baseKey?: string }) => {
        const list = formData[baseKey] || [];
        const update = (idx: number, patch: any) => {
            const arr = [...list];
            arr[idx] = { ...arr[idx], ...patch };
            setFormData({ ...formData, [baseKey]: arr });
        };
        const add = () => setFormData({ ...formData, [baseKey]: [...list, { tipo: 'CELULAR', ddd: 11, numero: 999999999 }] });
        const remove = (idx: number) => setFormData({ ...formData, [baseKey]: list.filter((_: any, i: number) => i !== idx) });
        return (
            <div className="grid gap-3">
                <div className="flex items-center justify-between">
                    <Label>Telefones</Label>
                    <Button type="button" variant="outline" size="sm" onClick={add}>Adicionar</Button>
                </div>
                {list.length === 0 && <p className="text-xs text-muted-foreground">Nenhum telefone adicionado.</p>}
                {list.map((tel: any, idx: number) => (
                    <div key={idx} className="grid md:grid-cols-4 gap-2 items-end">
                        <div className="grid gap-1">
                            <Label>Tipo</Label>
                            <Select value={tel.tipo} onValueChange={(v) => update(idx, { tipo: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIXO">Fixo</SelectItem>
                                    <SelectItem value="CELULAR">Celular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1">
                            <Label>DDD</Label>
                            <Input type="number" value={tel.ddd ?? ''} onChange={(e) => update(idx, { ddd: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-1 md:col-span-2">
                            <Label>Número</Label>
                            <Input type="number" value={tel.numero ?? ''} onChange={(e) => update(idx, { numero: Number(e.target.value) })} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>Remover</Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleOpenModal = (type: string, item: any | null = null) => {
        setEditingItem(item);
        const defaultUnitId = selectedUnitId || '';
        let initialData: any = {};
        switch (type) {
            case 'fila':
                initialData = item
                    ? { nome: item.nome, setorId: item.setor.id, unidadeAtendimentoId: item.unidade.id }
                    : { nome: '', setorId: '', unidadeAtendimentoId: defaultUnitId };
                break;
            case 'setor':
                initialData = item ? { nome: item.nome } : { nome: '' };
                break;
            case 'unidade':
                initialData = item
                    ? { nome: item.nome, endereco: item.endereco || { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', enderecoFormatado: '' }, telefones: item.telefones || [] }
                    : { nome: '', endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', enderecoFormatado: '' }, telefones: [] };
                break;
            case 'usuario':
                initialData = item
                    ? { nomeUsuario: item.nomeUsuario, email: item.email, senha: '', categoria: item.categoria, unidadesIds: item.unidadesIds || [] }
                    : { nomeUsuario: '', email: '', senha: '', categoria: CategoriaUsuario.USUARIO, unidadesIds: [] };
                break;
            case 'cliente':
                initialData = item
                    ? { cpf: item.cpf, nome: item.nome, email: item.email || '', telefones: item.telefones || [], endereco: item.endereco || { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', enderecoFormatado: '' } }
                    : { cpf: '', nome: '', email: '', telefones: [], endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', enderecoFormatado: '' } };
                break;
            case 'painel':
                initialData = item
                    ? { descricao: item.descricao, filasIds: item.filasIds || [] }
                    : { descricao: '', unidadeAtendimentoId: defaultUnitId, filasIds: [] };
                break;
        }
        setFormData(initialData);
        setModalOpen(type);
    };

    const handleSave = async () => {
        if (!modalOpen) return;
        setLoading(true);
        try {
            switch (modalOpen) {
                case 'fila': {
                    if (editingItem) await filaService.atualizarParcialmente(editingItem.id, formData);
                    else await filaService.criar({ ...formData, unidadeAtendimentoId: selectedUnitId! });
                    break;
                }
                case 'setor': {
                    if (editingItem) await setorService.substituir(editingItem.id, { nome: formData.nome });
                    else await setorService.criar({ nome: formData.nome });
                    break;
                }
                case 'unidade': {
                    if (editingItem) await unidadeService.atualizarParcialmente(editingItem.id, formData);
                    else await unidadeService.criar(formData);
                    break;
                }
                case 'usuario': {
                    if (editingItem) await usuarioService.atualizarParcialmente(editingItem.id, formData);
                    else await usuarioService.criar(formData);
                    break;
                }
                case 'cliente': {
                    if (editingItem) await clienteService.atualizarParcialmente(editingItem.id, formData);
                    else await clienteService.criar(formData);
                    break;
                }
                case 'painel': {
                    const payload = { ...formData, unidadeAtendimentoId: selectedUnitId };
                    if (editingItem) await painelService.atualizar(editingItem.id, payload);
                    else await painelService.criar(payload);
                    break;
                }
            }
            toast({ title: 'Sucesso', description: `Item ${editingItem ? 'atualizado' : 'criado'} com sucesso.` });
            setModalOpen(null);
            // Recarregar dados da aba ativa
            if (activeTab === 'filas') await searchFilas(0);
            if (activeTab === 'setores') await searchSetores(0);
            if (activeTab === 'unidades') await searchUnidades(0);
            if (activeTab === 'usuarios') await searchUsuarios(0);
            if (activeTab === 'clientes') await searchClientes(0);
            if (activeTab === 'paineis') await searchPaineis(0);
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message || 'Falha ao salvar o item.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        setLoading(true);
        try {
            switch (type) {
                case 'fila': await filaService.desativar(id); break;
                case 'setor': await setorService.desativar(id); break;
                case 'unidade': await unidadeService.desativar(id); break;
                case 'usuario': await usuarioService.desativar(id); break;
                case 'cliente': await clienteService.desativar(id); break;
                case 'painel': await painelService.desativar(id); break;
            }
            toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' });
            if (type === 'fila') await searchFilas(0);
            if (type === 'setor') await searchSetores(0);
            if (type === 'unidade') await searchUnidades(0);
            if (type === 'usuario') await searchUsuarios(0);
            if (type === 'cliente') await searchClientes(0);
            if (type === 'painel') await searchPaineis(0);
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message || 'Falha ao excluir o item.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const renderFilaNames = (filaIds: string[]) => {
        if (!filaIds || filaIds.length === 0) return <Badge variant="secondary">Nenhuma</Badge>;
        return (
            <div className="flex flex-wrap gap-1">
                {filaIds.map((id) => {
                    const fila = filaOptions.find((f) => f.id === id) || filas.find((f) => f.id === id);
                    return <Badge key={id} variant="secondary">{fila?.nome || 'Desconhecida'}</Badge>;
                })}
            </div>
        );
    };

    const handleFilaCheckboxChange = (filaId: string, checked: boolean) => {
        setFormData((prev: any) => {
            const filasIds = prev.filasIds || [];
            return {
                ...prev,
                filasIds: checked ? [...filasIds, filaId] : filasIds.filter((id: string) => id !== filaId)
            };
        });
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

                {/* TAB FILAS */}
                <TabsContent value="filas">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Gerenciar Filas</CardTitle>
                                    <CardDescription>Adicione, edite e remova as filas de atendimento.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenModal('fila')}><Plus className="w-4 h-4 mr-2" /> Nova Fila</Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={filaQuery}
                                        onChange={setFilaQuery}
                                        onSubmit={() => searchFilas(0)}
                                        placeholder="Buscar..."
                                        loading={filaLoading}
                                        modes={[{ value: 'porUnidade', label: 'Por Unidade' }, { value: 'todas', label: 'Todas as Filas' }]}
                                        mode={filaMode}
                                        onModeChange={(v) => setFilaMode(v as any)}
                                        onClear={() => { setFilaQuery(''); setFilaMode('todas'); setFilaUnidadeFilter(''); setFilas([]); setFilaMetaState(null); setFilaPage(0); }}
                                        unitFilter={{
                                            options: unidadeOptions.map(u => ({ value: u.id, label: u.nome })),
                                            value: filaUnidadeFilter || selectedUnitId || '',
                                            onChange: setFilaUnidadeFilter,
                                            title: 'Selecione a unidade',
                                        }}
                                    />
                                </div>
                                {filaMetaState && (
                                    <PaginationIconNav
                                        meta={filaMetaState}
                                        onFirst={() => searchFilas(0)}
                                        onPrev={() => searchFilas(Math.max(0, filaPage - 1))}
                                        onNext={() => searchFilas(filaPage + 1)}
                                        onLast={() => filaMetaState ? searchFilas(filaMetaState.totalPages - 1) : null}
                                        inline
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="[&_th]:bg-muted/50 [&_th]:text-foreground [&_th]:font-semibold">
                                    <TableRow>
                                        <TableHead className="min-w-[220px]">Nome</TableHead>
                                        <TableHead className="min-w-[200px]">Setor</TableHead>
                                        <TableHead className="min-w-[200px]">Unidade</TableHead>
                                        <TableHead className="sticky right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] whitespace-nowrap px-2">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td]:text-sm [&_td]:font-semibold [&_td]:text-foreground">
                                    {filas.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhuma fila cadastrada.</TableCell>
                                        </TableRow>
                                    )}
                                    {filas.map(fila => (
                                        <TableRow key={fila.id}>
                                            <TableCell>{fila.nome}</TableCell>
                                            <TableCell>{fila.setor.nome}</TableCell>
                                            <TableCell>{fila.unidade.nome}</TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] px-2">
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

                {/* TAB SETORES */}
                <TabsContent value="setores">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Gerenciar Setores</CardTitle>
                                    <CardDescription>Categorize as filas por setores.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenModal('setor')}><Plus className="w-4 h-4 mr-2" /> Novo Setor</Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={setQuery}
                                        onChange={setSetQuery}
                                        onSubmit={() => searchSetores(0)}
                                        placeholder="Buscar..."
                                        loading={setoresLoading}
                                        modes={[{ value: 'todas', label: 'Todos os Setores' }, { value: 'nome', label: 'Por Nome' }]}
                                        mode={setMode}
                                        onModeChange={(v) => setSetMode(v as any)}
                                        onClear={() => { setSetQuery(''); setSetMode('todas'); setSetores([]); setSetMeta(null); setSetPage(0); }}
                                    />
                                </div>
                                {setMeta && (
                                    <PaginationIconNav
                                        meta={setMeta}
                                        onFirst={() => searchSetores(0)}
                                        onPrev={() => searchSetores(Math.max(0, setPage - 1))}
                                        onNext={() => searchSetores(setPage + 1)}
                                        onLast={() => setMeta ? searchSetores(setMeta.totalPages - 1) : null}
                                        inline
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="[&_th]:bg-muted/50 [&_th]:text-foreground [&_th]:font-semibold">
                                    <TableRow>
                                        <TableHead className="min-w-[260px]">Nome</TableHead>
                                        <TableHead className="sticky right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] whitespace-nowrap px-2">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td]:text-sm [&_td]:font-semibold [&_td]:text-foreground">
                                    {setores.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground py-6">Nenhum setor cadastrado.</TableCell>
                                        </TableRow>
                                    )}
                                    {setores.map(setor => (
                                        <TableRow key={setor.id}>
                                            <TableCell>{setor.nome}</TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] px-2">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal('setor', setor)}><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete('setor', setor.id)}><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB UNIDADES */}
                <TabsContent value="unidades">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Gerenciar Unidades</CardTitle>
                                    <CardDescription>Cadastre locais de atendimento.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenModal('unidade')}><Plus className="w-4 h-4 mr-2" /> Nova Unidade</Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={uniQuery}
                                        onChange={setUniQuery}
                                        onSubmit={() => searchUnidades(0)}
                                        placeholder="Buscar..."
                                        loading={uniLoading}
                                        modes={[{ value: 'todas', label: 'Todas as Unidades' }, { value: 'nome', label: 'Por Nome' }]}
                                        mode={uniMode}
                                        onModeChange={(v) => setUniMode(v as any)}
                                        onClear={() => { setUniQuery(''); setUniMode('todas'); setUnidades([]); setUniMeta(null); setUniPage(0); }}
                                    />
                                </div>
                                {uniMeta && (
                                    <PaginationIconNav
                                        meta={uniMeta}
                                        onFirst={() => searchUnidades(0)}
                                        onPrev={() => searchUnidades(Math.max(0, uniPage - 1))}
                                        onNext={() => searchUnidades(uniPage + 1)}
                                        onLast={() => uniMeta ? searchUnidades(uniMeta.totalPages - 1) : null}
                                        inline
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="[&_th]:bg-muted/50 [&_th]:text-foreground [&_th]:font-semibold">
                                    <TableRow>
                                        <TableHead className="min-w-[220px]">Nome</TableHead>
                                        <TableHead className="min-w-[320px]">Endereço</TableHead>
                                        <TableHead className="min-w-[220px]">Telefones</TableHead>
                                        <TableHead className="sticky right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] whitespace-nowrap px-2">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td]:text-sm [&_td]:font-semibold [&_td]:text-foreground">
                                    {unidades.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhuma unidade cadastrada.</TableCell>
                                        </TableRow>
                                    )}
                                    {unidades.map(un => (
                                        <TableRow key={un.id}>
                                            <TableCell>{un.nome}</TableCell>
                                            <TableCell>{formatAddress(un.endereco)}</TableCell>
                                            <TableCell>{formatPhones(un.telefones)}</TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] px-2">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal('unidade', un)}><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete('unidade', un.id)}><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB USUÁRIOS */}
                <TabsContent value="usuarios">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Gerenciar Usuários</CardTitle>
                                    <CardDescription>Controle de acesso ao sistema.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenModal('usuario')}><UserPlus className="w-4 h-4 mr-2" /> Novo Usuário</Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={usrQuery}
                                        onChange={setUsrQuery}
                                        onSubmit={() => searchUsuarios(0)}
                                        placeholder="Buscar..."
                                        loading={usrLoading}
                                        modes={[{ value: 'todas', label: 'Todos os Usuários' }, { value: 'email', label: 'Por E-mail' }]}
                                        mode={usrMode}
                                        onModeChange={(v) => setUsrMode(v as any)}
                                        onClear={() => { setUsrQuery(''); setUsrMode('todas'); setUsuarios([]); setUsrMeta(null); setUsrPage(0); }}
                                    />
                                </div>
                                {usrMeta && (
                                    <PaginationIconNav
                                        meta={usrMeta}
                                        onFirst={() => searchUsuarios(0)}
                                        onPrev={() => searchUsuarios(Math.max(0, usrPage - 1))}
                                        onNext={() => searchUsuarios(usrPage + 1)}
                                        onLast={() => usrMeta ? searchUsuarios(usrMeta.totalPages - 1) : null}
                                        inline
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="[&_th]:bg-muted/50 [&_th]:text-foreground [&_th]:font-semibold">
                                    <TableRow>
                                        <TableHead className="min-w-[220px]">Nome</TableHead>
                                        <TableHead className="min-w-[260px]">Email</TableHead>
                                        <TableHead className="min-w-[160px]">Categoria</TableHead>
                                        <TableHead className="sticky right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] whitespace-nowrap px-2">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td]:text-sm [&_td]:font-semibold [&_td]:text-foreground">
                                    {usuarios.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum usuário cadastrado.</TableCell>
                                        </TableRow>
                                    )}
                                    {usuarios.map(us => (
                                        <TableRow key={us.id}>
                                            <TableCell>{us.nomeUsuario}</TableCell>
                                            <TableCell>{us.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={us.categoria === 'ADMINISTRADOR' ? 'default' : 'secondary'}>
                                                    {us.categoria}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] px-2">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal('usuario', us)}><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete('usuario', us.id)}><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB CLIENTES */}
                <TabsContent value="clientes">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Gerenciar Clientes</CardTitle>
                                    <CardDescription>Cadastro de pacientes/clientes.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenModal('cliente')}><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={cliQuery}
                                        onChange={setCliQuery}
                                        onSubmit={() => searchClientes(0)}
                                        placeholder="Buscar..."
                                        loading={cliLoading}
                                        modes={[{ value: 'todas', label: 'Todos os Clientes' }, { value: 'nome', label: 'Por Nome' }, { value: 'email', label: 'Por E-mail' }, { value: 'telefone', label: 'Por Telefone' }, { value: 'cpf', label: 'Por CPF' }]}
                                        mode={cliMode}
                                        onModeChange={(v) => setCliMode(v as any)}
                                        onClear={() => { setCliQuery(''); setCliMode('todas'); setClientes([]); setCliMeta(null); setCliPage(0); }}
                                    />
                                </div>
                                {cliMeta && (
                                    <PaginationIconNav
                                        meta={cliMeta}
                                        onFirst={() => searchClientes(0)}
                                        onPrev={() => searchClientes(Math.max(0, cliPage - 1))}
                                        onNext={() => searchClientes(cliPage + 1)}
                                        onLast={() => cliMeta ? searchClientes(cliMeta.totalPages - 1) : null}
                                        inline
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="[&_th]:bg-muted/50 [&_th]:text-foreground [&_th]:font-semibold">
                                    <TableRow>
                                        <TableHead className="min-w-[220px]">Nome</TableHead>
                                        <TableHead className="min-w-[160px]">CPF</TableHead>
                                        <TableHead className="min-w-[260px]">Email</TableHead>
                                        <TableHead className="min-w-[220px]">Telefones</TableHead>
                                        <TableHead className="min-w-[320px]">Endereço</TableHead>
                                        <TableHead className="sticky right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] whitespace-nowrap px-2">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td]:text-sm [&_td]:font-semibold [&_td]:text-foreground">
                                    {clientes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhum cliente cadastrado.</TableCell>
                                        </TableRow>
                                    )}
                                    {clientes.map(cl => (
                                        <TableRow key={cl.id}>
                                            <TableCell>{cl.nome}</TableCell>
                                            <TableCell>{cl.cpf}</TableCell>
                                            <TableCell>{cl.email || '—'}</TableCell>
                                            <TableCell>{formatPhones(cl.telefones)}</TableCell>
                                            <TableCell>{formatAddress(cl.endereco)}</TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] px-2">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal('cliente', cl)}><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete('cliente', cl.id)}><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB PAINÉIS */}
                <TabsContent value="paineis">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Gerenciar Painéis</CardTitle>
                                    <CardDescription>Crie e configure os painéis de exibição pública.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenModal('painel')}>
                                    <Plus className="w-4 h-4 mr-2" /> Novo Painel
                                </Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={''}
                                        onChange={() => {}}
                                        onSubmit={() => searchPaineis(0)}
                                        placeholder="Buscar..."
                                        loading={painelLoading}
                                        modes={[{ value: 'porUnidade', label: 'Por Unidade' }]}
                                        mode={'porUnidade'}
                                        onModeChange={() => {}}
                                        onClear={() => { setPainelUnidadeFilter(''); setPaineis([]); setPainelMeta(null); setPainelPage(0); }}
                                        unitFilter={{
                                            options: unidadeOptions.map(u => ({ value: u.id, label: u.nome })),
                                            value: painelUnidadeFilter || '',
                                            onChange: setPainelUnidadeFilter,
                                            title: 'Selecione a unidade',
                                        }}
                                    />
                                </div>
                                {painelMeta && (
                                    <PaginationIconNav
                                        meta={painelMeta}
                                        onFirst={() => searchPaineis(0)}
                                        onPrev={() => searchPaineis(Math.max(0, painelPage - 1))}
                                        onNext={() => searchPaineis(painelPage + 1)}
                                        onLast={() => painelMeta ? searchPaineis((painelMeta.totalPages ?? 1) - 1) : null}
                                        inline
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="[&_th]:bg-muted/50 [&_th]:text-foreground [&_th]:font-semibold">
                                    <TableRow>
                                        <TableHead className="min-w-[280px]">Descrição</TableHead>
                                        <TableHead className="min-w-[280px]">Filas Vinculadas</TableHead>
                                        <TableHead className="sticky right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] whitespace-nowrap px-2">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td]:text-sm [&_td]:font-semibold [&_td]:text-foreground">
                                    {paineis.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Nenhum painel cadastrado.</TableCell>
                                        </TableRow>
                                    )}
                                    {paineis.map(painel => (
                                        <TableRow key={painel.id}>
                                            <TableCell className="font-semibold">{painel.descricao}</TableCell>
                                            <TableCell>{renderFilaNames(painel.filasIds)}</TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[inset_1px_0_0_theme(colors.border)] text-right w-[112px] min-w-[112px] px-2">
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

            {/* MODAL FILA */}
            <Dialog open={modalOpen === 'fila'} onOpenChange={() => setModalOpen(null)}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Fila' : 'Nova Fila'}</DialogTitle>
                        <DialogDescription>Defina o nome e associe setor e unidade.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nome *</Label>
                            <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Setor *</Label>
                            <Select value={formData.setorId || ''} onValueChange={(v) => setFormData({ ...formData, setorId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {setorOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Unidade *</Label>
                            <Select value={formData.unidadeAtendimentoId || selectedUnitId || ''} onValueChange={(v) => setFormData({ ...formData, unidadeAtendimentoId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {unidadeOptions.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL SETOR */}
            <Dialog open={modalOpen === 'setor'} onOpenChange={() => setModalOpen(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
                        <DialogDescription>Informe o nome do setor.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nome *</Label>
                            <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL UNIDADE */}
            <Dialog open={modalOpen === 'unidade'} onOpenChange={() => setModalOpen(null)}>
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
                        <DialogDescription>Cadastre dados básicos da unidade.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nome *</Label>
                            <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                        </div>
                        <AddressFields baseKey="endereco" />
                        <PhonesFields baseKey="telefones" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL USUÁRIO */}
            <Dialog open={modalOpen === 'usuario'} onOpenChange={() => setModalOpen(null)}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                        <DialogDescription>Defina os dados de acesso.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Nome *</Label>
                                <Input value={formData.nomeUsuario || ''} onChange={(e) => setFormData({ ...formData, nomeUsuario: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email *</Label>
                                <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                        {!editingItem && (
                            <div className="grid gap-2">
                                <Label>Senha *</Label>
                                <Input type="password" value={formData.senha || ''} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label>Categoria *</Label>
                            <Select value={formData.categoria || CategoriaUsuario.USUARIO} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={CategoriaUsuario.ADMINISTRADOR}>Administrador</SelectItem>
                                    <SelectItem value={CategoriaUsuario.USUARIO}>Usuário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Unidades (opcional)</Label>
                            <ScrollArea className="h-32 rounded border p-2">
                                <div className="space-y-2">
                                    {unidadeOptions.map(u => {
                                        const checked = (formData.unidadesIds || []).includes(u.id);
                                        return (
                                            <div key={u.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`unid-${u.id}`}
                                                    checked={checked}
                                                    onCheckedChange={(ck) => {
                                                        setFormData((prev: any) => {
                                                            const ids = prev.unidadesIds || [];
                                                            return {
                                                                ...prev,
                                                                unidadesIds: ck ? [...ids, u.id] : ids.filter((i: string) => i !== u.id)
                                                            };
                                                        });
                                                    }}
                                                />
                                                <Label htmlFor={`unid-${u.id}`} className="cursor-pointer">{u.nome}</Label>
                                            </div>
                                        );
                                    })}
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

            {/* MODAL CLIENTE */}
            <Dialog open={modalOpen === 'cliente'} onOpenChange={() => setModalOpen(null)}>
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                        <DialogDescription>Cadastre os dados do cliente.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>CPF *</Label>
                                <Input value={formData.cpf || ''} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Nome *</Label>
                                <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <PhonesFields baseKey="telefones" />
                        <AddressFields baseKey="endereco" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Gestao;
