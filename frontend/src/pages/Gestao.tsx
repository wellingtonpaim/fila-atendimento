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
import { Plus, Edit, Trash2, UserPlus, Shield, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Services
import { filaService } from '@/services/filaService';
import { setorService } from '@/services/setorService';
import { unidadeService } from '@/services/unidadeService';
import { usuarioService } from '@/services/usuarioService';
import { clienteService } from '@/services/clienteService';
import { authService } from '@/services/authService';

// Types
import {
  FilaCreateDTO,
  FilaResponseDTO,
  SetorCreateDTO,
  SetorResponseDTO,
  UnidadeAtendimentoCreateDTO,
  UnidadeAtendimentoResponseDTO,
  UsuarioCreateDTO,
  UsuarioResponseDTO,
  CategoriaUsuario,
  TipoTelefone,
  Telefone,
  ClienteCreateDTO,
  ClienteResponseDTO
} from '@/types';

interface FormErrors { [key: string]: string }

// Helper: base URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

// Helper: metadados de paginação
interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  page: number; // 0-based vindo do backend
  pageSize: number;
}

const Gestao = () => {
  const { toast } = useToast();

  // Controle da aba ativa (persistida)
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gestao_active_tab') : null;
    const allowed = new Set(['filas','setores','unidades','usuarios','clientes']);
    return saved && allowed.has(saved) ? saved : 'filas';
  });
  useEffect(() => { try { localStorage.setItem('gestao_active_tab', activeTab); } catch {} }, [activeTab]);

  // ===== Dados =====
  const [filas, setFilas] = useState<FilaResponseDTO[]>([]);
  const [setores, setSetores] = useState<SetorResponseDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeAtendimentoResponseDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);

  // ===== Estados globais =====
  const [loading, setLoading] = useState(false);

  // ===== Modais =====
  const [filaModalOpen, setFilaModalOpen] = useState(false);
  const [setorModalOpen, setSetorModalOpen] = useState(false);
  const [unidadeModalOpen, setUnidadeModalOpen] = useState(false);
  const [usuarioModalOpen, setUsuarioModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);

  // ===== Edição =====
  const [editingFila, setEditingFila] = useState<FilaResponseDTO | null>(null);
  const [editingSetor, setEditingSetor] = useState<SetorResponseDTO | null>(null);
  const [editingUnidade, setEditingUnidade] = useState<UnidadeAtendimentoResponseDTO | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioResponseDTO | null>(null);
  const [editingCliente, setEditingCliente] = useState<ClienteResponseDTO | null>(null);

  // ===== Formulários =====
  const [filaForm, setFilaForm] = useState<FilaCreateDTO>({ nome: '', setorId: '', unidadeAtendimentoId: '' });
  const [setorForm, setSetorForm] = useState<SetorCreateDTO>({ nome: '' });
  const [unidadeForm, setUnidadeForm] = useState<UnidadeAtendimentoCreateDTO>({
    nome: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined },
    telefones: []
  });
  const [usuarioForm, setUsuarioForm] = useState<UsuarioCreateDTO>({
    nomeUsuario: '', email: '', senha: '', categoria: CategoriaUsuario.USUARIO, unidadesIds: []
  });
  const [clienteForm, setClienteForm] = useState<ClienteCreateDTO>({
    cpf: '', nome: '', email: '',
    telefones: [],
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined }
  });

  // Telefones temporários
  const [telefoneTemp, setTelefoneTemp] = useState<Telefone>({ tipo: TipoTelefone.FIXO, ddd: 11, numero: 0 });
  const [telefoneClienteTemp, setTelefoneClienteTemp] = useState<Telefone>({ tipo: TipoTelefone.CELULAR, ddd: 11, numero: 0 });

  // Erros de validação
  const [errors, setErrors] = useState<FormErrors>({});

  // ===== Paginação/Busca por aba =====
  // Filas
  const [filasPage, setFilasPage] = useState(0);
  const [filasSize, setFilasSize] = useState(10);
  const [filasMeta, setFilasMeta] = useState<PaginationMeta | null>(null);
  const [filasUnidadeId, setFilasUnidadeId] = useState<string>('');
  const [filasSearchType, setFilasSearchType] = useState<'unidade'|'nome'|'setor'>('unidade');
  const [filasSearchValue, setFilasSearchValue] = useState('');
  const [filasSetorId, setFilasSetorId] = useState<string>('');

  // Setores
  const [setoresPage, setSetoresPage] = useState(0);
  const [setoresSize, setSetoresSize] = useState(10);
  const [setoresMeta, setSetoresMeta] = useState<PaginationMeta | null>(null);
  const [setoresSearchType, setSetoresSearchType] = useState<'todos'|'nome'>('todos');
  const [setoresSearchValue, setSetoresSearchValue] = useState('');

  // Unidades
  const [unidadesPage, setUnidadesPage] = useState(0);
  const [unidadesSize, setUnidadesSize] = useState(10);
  const [unidadesMeta, setUnidadesMeta] = useState<PaginationMeta | null>(null);
  const [unidadesSearchType, setUnidadesSearchType] = useState<'todos'|'nome'>('todos');
  const [unidadesSearchValue, setUnidadesSearchValue] = useState('');

  // Usuários
  const [usuariosPage, setUsuariosPage] = useState(0);
  const [usuariosSize, setUsuariosSize] = useState(10);
  const [usuariosMeta, setUsuariosMeta] = useState<PaginationMeta | null>(null);
  const [usuariosSearchType, setUsuariosSearchType] = useState<'todos'|'email'|'nome'>('todos');
  const [usuariosSearchValue, setUsuariosSearchValue] = useState('');

  // Clientes
  const [clientesPage, setClientesPage] = useState(0);
  const [clientesSize, setClientesSize] = useState(10);
  const [clientesMeta, setClientesMeta] = useState<PaginationMeta | null>(null);
  const [clientesSearchType, setClientesSearchType] = useState<'todos'|'nome'|'cpf'>('todos');
  const [clientesSearchValue, setClientesSearchValue] = useState('');

  // Opções completas para selects (não paginadas)
  const [unidadeOptions, setUnidadeOptions] = useState<UnidadeAtendimentoResponseDTO[]>([]);
  const [setorOptions, setSetorOptions] = useState<SetorResponseDTO[]>([]);

  // ===== Helpers =====
  const pageDisplay = (meta: PaginationMeta | null, statePage: number) => {
    const current = (meta?.page ?? statePage) + 1; // 1-based
    const total = Math.max(1, meta?.totalPages ?? 1);
    return { current: Math.min(current, total), total };
  };

  // Helpers de formatação e paginação
  const formatCepMask = (value: string): string => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0,5)}-${digits.slice(5)}`;
  };

  function clientPaginate<T>(allItems: T[], page: number, size: number) {
    const totalCount = allItems.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const safePage = Math.min(Math.max(0, page), totalPages - 1);
    const slice = allItems.slice(safePage * size, safePage * size + size);
    return { slice, meta: { totalCount, totalPages, page: safePage, pageSize: size as number } };
  }

  async function fetchPageData<T>(path: string, page: number, size: number): Promise<T[]> {
    const url = new URL(`${API_BASE_URL}${path}`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('size', String(size));
    const res = await fetch(url.toString(), { headers: authService.getAuthHeaders() });
    if (!res.ok) throw new Error(res.statusText);
    const body = await res.json();
    return (body?.data || []) as T[];
  }

  async function getAllItems<T extends { id?: string }>(path: string, fetchSize = 200, maxLoops = 50): Promise<T[]> {
    const all: T[] = [];
    const seen = new Set<string>();
    let page = 0;
    let lastFirstId: string | null = null;
    while (page < maxLoops) {
      const batch = await fetchPageData<T>(path, page, fetchSize);
      if (!Array.isArray(batch) || batch.length === 0) break;
      // Se servidor ignorar paginação e devolver sempre tudo, evite loop infinito
      const firstId = (batch[0] as any)?.id || `${JSON.stringify(batch[0])}`;
      if (page > 0 && firstId && firstId === lastFirstId) break;
      lastFirstId = firstId || null;

      for (const item of batch) {
        const id = (item as any)?.id ? String((item as any).id) : JSON.stringify(item);
        if (!seen.has(id)) { seen.add(id); all.push(item); }
      }

      if (batch.length < fetchSize) break;
      page += 1;
    }
    return all;
  }

  // Agregador para buscar filas por nome/setor dentro da unidade
  const loadFilasByNomeOuSetor = async ({ page = filasPage, size = filasSize, unidadeId, nome, setorId }:
    { page?: number; size?: number; unidadeId: string; nome?: string; setorId?: string; }) => {
    if (!unidadeId) { setFilas([]); setFilasMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); return; }
    const fetchSize = 50; // reduzir chamadas
    let all: FilaResponseDTO[] = [];
    try {
      const first = await getPaginated<FilaResponseDTO[]>(`/api/filas/unidade/${unidadeId}`, { page: 0, size: fetchSize });
      all = [...(first.data || [])];
      const totalBackendPages = first.meta?.totalPages ?? 1;
      for (let p = 1; p < totalBackendPages; p++) {
        const { data } = await getPaginated<FilaResponseDTO[]>(`/api/filas/unidade/${unidadeId}`, { page: p, size: fetchSize });
        all.push(...(data || []));
      }
    } catch {
      setFilas([]); setFilasMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); return;
    }
    let filtered = all;
    if (nome?.trim()) filtered = filtered.filter(f => f.nome?.toLowerCase().includes(nome.toLowerCase()));
    if (setorId?.trim()) filtered = filtered.filter(f => f.setor?.id === setorId);
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const safePage = Math.min(page, totalPages - 1);
    const slice = filtered.slice(safePage * size, safePage * size + size);
    setFilas(slice);
    setFilasMeta({ totalCount, totalPages, page: safePage, pageSize: size });
    setFilasPage(safePage);
    setFilasSize(size);
  };

  // ===== Loaders =====
  const loadFilasPage = async (page = filasPage, size = filasSize, unidadeIdParam?: string) => {
    const unidadeId = unidadeIdParam ?? filasUnidadeId;
    try {
      let all: FilaResponseDTO[] = [];
      if (!unidadeId && filasSearchType === 'unidade') {
        setFilas([]); setFilasMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); return;
      }
      if (filasSearchType === 'unidade') {
        all = await getAllItems<FilaResponseDTO>(`/api/filas/unidade/${unidadeId}`);
      } else {
        // Carrega todas as filas de todas unidades e filtra (se necessário)
        all = await getAllItems<FilaResponseDTO>(`/api/filas`);
        if (filasSearchType === 'nome' && filasSearchValue.trim()) {
          all = all.filter(f => f.nome?.toLowerCase().includes(filasSearchValue.toLowerCase()));
        }
        if (filasSearchType === 'setor' && filasSetorId.trim()) {
          all = all.filter(f => f.setor?.id === filasSetorId);
        }
        if (unidadeId) {
          all = all.filter(f => f.unidade?.id === unidadeId);
        }
      }
      const { slice, meta } = clientPaginate(all, page, size);
      setFilas(slice); setFilasMeta(meta); setFilasPage(meta.page); setFilasSize(meta.pageSize);
    } catch { setFilas([]); setFilasMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
  };

  const loadSetoresPage = async (page = setoresPage, size = setoresSize) => {
    try {
      const all = await getAllItems<SetorResponseDTO>('/api/setores');
      const filtered = (setoresSearchType === 'nome' && setoresSearchValue.trim())
        ? all.filter(s => s.nome?.toLowerCase().includes(setoresSearchValue.toLowerCase()))
        : all;
      const { slice, meta } = clientPaginate(filtered, page, size);
      setSetores(slice); setSetoresMeta(meta); setSetoresPage(meta.page); setSetoresSize(meta.pageSize);
    } catch { setSetores([]); setSetoresMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
  };

  const loadUnidadesPage = async (page = unidadesPage, size = unidadesSize) => {
    try {
      const all = await getAllItems<UnidadeAtendimentoResponseDTO>('/api/unidades-atendimento');
      const filtered = (unidadesSearchType === 'nome' && unidadesSearchValue.trim())
        ? all.filter(u => u.nome?.toLowerCase().includes(unidadesSearchValue.toLowerCase()))
        : all;
      const { slice, meta } = clientPaginate(filtered, page, size);
      setUnidades(slice); setUnidadesMeta(meta); setUnidadesPage(meta.page); setUnidadesSize(meta.pageSize);
    } catch { setUnidades([]); setUnidadesMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
  };

  const loadUsuariosPage = async (page = usuariosPage, size = usuariosSize) => {
    try {
      if (usuariosSearchType === 'email' && usuariosSearchValue.trim()) {
        const res = await fetch(`${API_BASE_URL}/api/usuarios/email/${encodeURIComponent(usuariosSearchValue)}`, { headers: authService.getAuthHeaders() });
        if (res.ok) {
          const body = await res.json();
          const item = body.data as UsuarioResponseDTO;
          setUsuarios(item ? [item] : []);
          setUsuariosMeta({ totalCount: item ? 1 : 0, totalPages: 1, page: 0, pageSize: 1 });
          setUsuariosPage(0); setUsuariosSize(1);
        } else { setUsuarios([]); setUsuariosMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
      } else {
        const all = await getAllItems<UsuarioResponseDTO>('/api/usuarios');
        const filtered = (usuariosSearchType === 'nome' && usuariosSearchValue.trim())
          ? all.filter(u => u.nomeUsuario?.toLowerCase().includes(usuariosSearchValue.toLowerCase()))
          : all;
        const { slice, meta } = clientPaginate(filtered, page, size);
        setUsuarios(slice); setUsuariosMeta(meta); setUsuariosPage(meta.page); setUsuariosSize(meta.pageSize);
      }
    } catch { setUsuarios([]); setUsuariosMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
  };

  const loadClientesPage = async (page = clientesPage, size = clientesSize) => {
    try {
      if (clientesSearchType === 'cpf' && clientesSearchValue.trim()) {
        const res = await fetch(`${API_BASE_URL}/api/clientes/cpf/${encodeURIComponent(clientesSearchValue)}`, { headers: authService.getAuthHeaders() });
        if (res.ok) {
          const body = await res.json();
          const item = body.data as ClienteResponseDTO;
          setClientes(item ? [item] : []);
          setClientesMeta({ totalCount: item ? 1 : 0, totalPages: 1, page: 0, pageSize: 1 });
          setClientesPage(0); setClientesSize(1);
        } else { setClientes([]); setClientesMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
      } else {
        const all = await getAllItems<ClienteResponseDTO>('/api/clientes');
        const filtered = (clientesSearchType === 'nome' && clientesSearchValue.trim())
          ? all.filter(c => c.nome?.toLowerCase().includes(clientesSearchValue.toLowerCase()))
          : all;
        const { slice, meta } = clientPaginate(filtered, page, size);
        setClientes(slice); setClientesMeta(meta); setClientesPage(meta.page); setClientesSize(meta.pageSize);
      }
    } catch { setClientes([]); setClientesMeta({ totalCount: 0, totalPages: 1, page: 0, pageSize: size }); }
  };

  // ===== Inicialização =====
  useEffect(() => { carregarDados() }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [setoresAll, unidadesAll] = await Promise.all([ setorService.listarTodos(), unidadeService.listarTodas() ]);
      setSetorOptions(setoresAll.data || []);
      setUnidadeOptions(unidadesAll.data || []);
      const defaultUnid = (unidadesAll.data && unidadesAll.data[0]?.id) || '';
      setFilasUnidadeId(prev => prev || defaultUnid);
      await Promise.all([
        loadSetoresPage(0, setoresSize),
        loadUnidadesPage(0, unidadesSize),
        loadUsuariosPage(0, usuariosSize),
        loadClientesPage(0, clientesSize)
      ]);
      await loadFilasPage(0, filasSize, defaultUnid);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setFilas([]); setSetores([]); setUnidades([]); setUsuarios([]); setClientes([]);
      setFilasMeta(null); setSetoresMeta(null); setUnidadesMeta(null); setUsuariosMeta(null); setClientesMeta(null);
      toast({ title: 'Erro', description: 'Erro ao carregar dados.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ===== Validações =====
  const validarFilaForm = (form: FilaCreateDTO): FormErrors => {
    const e: FormErrors = {};
    if (!form.nome || form.nome.length < 3 || form.nome.length > 50) e.nome = 'Nome deve ter entre 3 e 50 caracteres';
    if (!form.setorId) e.setorId = 'Setor é obrigatório';
    if (!form.unidadeAtendimentoId) e.unidadeAtendimentoId = 'Unidade de Atendimento é obrigatória';
    return e;
  };
  const validarSetorForm = (form: SetorCreateDTO): FormErrors => {
    const e: FormErrors = {}; if (!form.nome || form.nome.length < 3 || form.nome.length > 50) e.nome = 'Nome deve ter entre 3 e 50 caracteres'; return e;
  };
  const validarUnidadeForm = (form: UnidadeAtendimentoCreateDTO): FormErrors => {
    const e: FormErrors = {};
    if (!form.nome || form.nome.length < 3 || form.nome.length > 100) e.nome = 'Nome deve ter entre 3 e 100 caracteres';
    if (form.endereco?.logradouro && !form.endereco.logradouro.trim()) e.logradouro = 'Logradouro não pode ser vazio';
    if (form.endereco?.numero && !form.endereco.numero.trim()) e.numero = 'Número não pode ser vazio';
    return e;
  };
  const validarUsuarioForm = (form: UsuarioCreateDTO): FormErrors => {
    const e: FormErrors = {};
    if (!form.nomeUsuario || form.nomeUsuario.length < 3) e.nomeUsuario = 'Nome de usuário deve ter pelo menos 3 caracteres';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email deve ter um formato válido';
    if (!editingUsuario && (!form.senha || form.senha.length < 6)) e.senha = 'Senha deve ter pelo menos 6 caracteres';
    return e;
  };
  const validarClienteForm = (form: ClienteCreateDTO): FormErrors => {
    const e: FormErrors = {};
    if (!form.cpf || !form.cpf.trim()) e.cpf = 'CPF é obrigatório';
    if (!form.nome || form.nome.length < 3 || form.nome.length > 100) e.nome = 'Nome deve ter entre 3 e 100 caracteres';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    // Endereço é opcional; só validar campos se preenchidos
    if (form.endereco) {
      if (form.endereco.logradouro && !form.endereco.logradouro.trim()) e.logradouro = 'Logradouro não pode ser vazio';
      if (form.endereco.numero && !form.endereco.numero.trim()) e.numero = 'Número não pode ser vazio';
    }
    return e;
  };

  // ===== Handlers CRUD =====
  const handleSalvarFila = async () => {
    const errs = validarFilaForm(filaForm); if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      if (editingFila) {
        await filaService.atualizarParcialmente(editingFila.id, { nome: filaForm.nome, setorId: filaForm.setorId, unidadeAtendimentoId: filaForm.unidadeAtendimentoId });
        toast({ title: 'Sucesso', description: 'Fila atualizada com sucesso' });
      } else { await filaService.criar(filaForm); toast({ title: 'Sucesso', description: 'Fila criada com sucesso' }); }
      setFilaModalOpen(false); setErrors({}); setEditingFila(null); setFilaForm({ nome: '', setorId: '', unidadeAtendimentoId: '' }); carregarDados();
    } catch { toast({ title: 'Erro', description: 'Erro ao salvar fila', variant: 'destructive' }); }
  };
  const handleEditarFila = (fila: FilaResponseDTO) => { setEditingFila(fila); setFilaForm({ nome: fila.nome, setorId: fila.setor.id, unidadeAtendimentoId: fila.unidade.id }); setFilaModalOpen(true); };
  const handleExcluirFila = async (id: string) => { if (confirm('Tem certeza que deseja excluir esta fila?')) { try { await filaService.desativar(id); toast({ title: 'Sucesso', description: 'Fila excluída com sucesso' }); carregarDados(); } catch { toast({ title: 'Erro', description: 'Erro ao excluir fila', variant: 'destructive' }); } } };

  const handleSalvarSetor = async () => {
    const errs = validarSetorForm(setorForm); if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      if (editingSetor) { await setorService.substituir(editingSetor.id, setorForm); toast({ title: 'Sucesso', description: 'Setor atualizado com sucesso' }); }
      else { await setorService.criar(setorForm); toast({ title: 'Sucesso', description: 'Setor criado com sucesso' }); }
      setSetorModalOpen(false); setErrors({}); setEditingSetor(null); setSetorForm({ nome: '' }); carregarDados();
    } catch { toast({ title: 'Erro', description: 'Erro ao salvar setor', variant: 'destructive' }); }
  };
  const handleEditarSetor = (setor: SetorResponseDTO) => { setEditingSetor(setor); setSetorForm({ nome: setor.nome }); setSetorModalOpen(true); };
  const handleExcluirSetor = async (id: string) => { if (confirm('Tem certeza que deseja excluir este setor?')) { try { await setorService.desativar(id); toast({ title: 'Sucesso', description: 'Setor excluído com sucesso' }); carregarDados(); } catch { toast({ title: 'Erro', description: 'Erro ao excluir setor', variant: 'destructive' }); } } };

  const handleSalvarUnidade = async () => {
    const errs = validarUnidadeForm(unidadeForm); if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const enderecoSan: any = { ...unidadeForm.endereco };
      if (enderecoSan?.cep) enderecoSan.cep = String(enderecoSan.cep).replace(/\D/g, '');
      const payload = { ...unidadeForm, endereco: enderecoSan };
      if (editingUnidade) { await unidadeService.atualizarParcialmente(editingUnidade.id, payload); toast({ title: 'Sucesso', description: 'Unidade atualizada com sucesso' }); }
      else { await unidadeService.criar(payload); toast({ title: 'Sucesso', description: 'Unidade criada com sucesso' }); }
      setUnidadeModalOpen(false); setErrors({}); setEditingUnidade(null);
      setUnidadeForm({ nome: '', endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined }, telefones: [] });
      carregarDados();
    } catch { toast({ title: 'Erro', description: 'Erro ao salvar unidade', variant: 'destructive' }); }
  };
  const handleEditarUnidade = (unidade: UnidadeAtendimentoResponseDTO) => {
    setEditingUnidade(unidade);
    setUnidadeForm({ nome: unidade.nome, endereco: unidade.endereco || { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined }, telefones: unidade.telefones || [] });
    setUnidadeModalOpen(true);
  };
  const handleExcluirUnidade = async (id: string) => { if (confirm('Tem certeza que deseja excluir esta unidade?')) { try { await unidadeService.desativar(id); toast({ title: 'Sucesso', description: 'Unidade excluída com sucesso' }); carregarDados(); } catch { toast({ title: 'Erro', description: 'Erro ao excluir unidade', variant: 'destructive' }); } } };

  const adicionarTelefone = () => { if (telefoneTemp.ddd && telefoneTemp.numero) { setUnidadeForm(p => ({ ...p, telefones: [...(p.telefones || []), telefoneTemp] })); setTelefoneTemp({ tipo: TipoTelefone.FIXO, ddd: 11, numero: 0 }); } };

  const handleSalvarUsuario = async () => {
    const errs = validarUsuarioForm(usuarioForm);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      if (editingUsuario) {
        await usuarioService.atualizarParcialmente(editingUsuario.id, {
          nomeUsuario: usuarioForm.nomeUsuario,
          email: usuarioForm.email,
          categoria: usuarioForm.categoria,
          unidadesIds: usuarioForm.unidadesIds
        });
        toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso' });
      } else {
        await usuarioService.criar(usuarioForm);
        toast({ title: 'Sucesso', description: 'Usuário criado com sucesso' });
      }
      setUsuarioModalOpen(false);
      setErrors({});
      setEditingUsuario(null);
      setUsuarioForm({ nomeUsuario: '', email: '', senha: '', categoria: CategoriaUsuario.USUARIO, unidadesIds: [] });
      carregarDados();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar usuário', variant: 'destructive' });
    }
  };

  const handleEditarUsuario = (usuario: UsuarioResponseDTO) => {
    setEditingUsuario(usuario);
    setUsuarioForm({
      nomeUsuario: usuario.nomeUsuario,
      email: usuario.email,
      senha: '',
      categoria: usuario.categoria,
      unidadesIds: usuario.unidadesIds || []
    });
    setUsuarioModalOpen(true);
  };

  const handleExcluirUsuario = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usuarioService.desativar(id);
        toast({ title: 'Sucesso', description: 'Usuário excluído com sucesso' });
        carregarDados();
      } catch {
        toast({ title: 'Erro', description: 'Erro ao excluir usuário', variant: 'destructive' });
      }
    }
  };

  const handlePromoverUsuario = async (id: string) => {
    if (confirm('Tem certeza que deseja promover este usuário para administrador?')) {
      try {
        await usuarioService.promoverParaAdministrador(id);
        toast({ title: 'Sucesso', description: 'Usuário promovido com sucesso' });
        carregarDados();
      } catch {
        toast({ title: 'Erro', description: 'Erro ao promover usuário', variant: 'destructive' });
      }
    }
  };

  const adicionarTelefoneCliente = () => {
    if (telefoneClienteTemp.ddd && telefoneClienteTemp.numero) {
      setClienteForm(p => ({ ...p, telefones: [...(p.telefones || []), telefoneClienteTemp] }));
      setTelefoneClienteTemp({ tipo: TipoTelefone.CELULAR, ddd: 11, numero: 0 });
    }
  };

  const handleSalvarCliente = async () => {
    // Sanitização: enviar apenas campos realmente preenchidos
    const end = (clienteForm.endereco || {});
    const enderecoSan: any = {};
    if (end.logradouro?.trim()) enderecoSan.logradouro = end.logradouro.trim();
    if (end.numero?.trim()) enderecoSan.numero = end.numero.trim();
    if (end.complemento?.trim()) enderecoSan.complemento = end.complemento.trim();
    if (end.bairro?.trim()) enderecoSan.bairro = end.bairro.trim();
    if (end.cidade?.trim()) enderecoSan.cidade = end.cidade.trim();
    if (end.cep?.trim()) enderecoSan.cep = end.cep.replace(/[^0-9]/g, '');
    if (end.uf) enderecoSan.uf = end.uf;

    const telsSan = (clienteForm.telefones || [])
      .filter(t => Number(t.ddd) > 0 && Number(t.numero) > 0)
      .map(t => ({ tipo: t.tipo, ddd: Number(t.ddd), numero: Number(t.numero) }));

    const payload: ClienteCreateDTO = {
      cpf: clienteForm.cpf.trim(),
      nome: clienteForm.nome.trim(),
      email: clienteForm.email?.trim() || undefined,
      endereco: Object.keys(enderecoSan).length ? enderecoSan : undefined,
      telefones: telsSan.length ? telsSan : undefined,
    } as ClienteCreateDTO;

    const errs = validarClienteForm(payload);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      if (editingCliente) {
        await clienteService.atualizarParcialmente(editingCliente.id, payload as any);
        toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso' });
      } else {
        await clienteService.criar(payload);
        toast({ title: 'Sucesso', description: 'Cliente criado com sucesso' });
      }
      setClienteModalOpen(false);
      setErrors({});
      setEditingCliente(null);
      setClienteForm({ cpf: '', nome: '', email: '', telefones: [], endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined } });
      carregarDados();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar cliente', variant: 'destructive' });
    }
  };

  const handleEditarCliente = (cliente: ClienteResponseDTO) => {
    setEditingCliente(cliente);
    setClienteForm({
      cpf: cliente.cpf || '',
      nome: cliente.nome || '',
      email: cliente.email || '',
      telefones: cliente.telefones || [],
      endereco: cliente.endereco || { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined }
    });
    setClienteModalOpen(true);
  };

  const handleExcluirCliente = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clienteService.desativar(id);
        toast({ title: 'Sucesso', description: 'Cliente excluído com sucesso' });
        carregarDados();
      } catch {
        toast({ title: 'Erro', description: 'Erro ao excluir cliente', variant: 'destructive' });
      }
    }
  };

  // ===== Handlers de Busca (reset dos filtros após buscar) =====
  const handleBuscarFilas = async () => {
    await loadFilasPage(0, filasSize);
    setFilasSearchType('unidade');
    setFilasSearchValue('');
    setFilasSetorId('');
    setFilasUnidadeId('');
    setFilasPage(0);
  };
  const handleBuscarSetores = async () => {
    await loadSetoresPage(0, setoresSize);
    setSetoresSearchType('todos');
    setSetoresSearchValue('');
    setSetoresPage(0);
  };
  const handleBuscarUnidades = async () => {
    await loadUnidadesPage(0, unidadesSize);
    setUnidadesSearchType('todos');
    setUnidadesSearchValue('');
    setUnidadesPage(0);
  };
  const handleBuscarUsuarios = async () => {
    await loadUsuariosPage(0, usuariosSize);
    setUsuariosSearchType('todos');
    setUsuariosSearchValue('');
    setUsuariosPage(0);
  };
  const handleBuscarClientes = async () => {
    await loadClientesPage(0, clientesSize);
    setClientesSearchType('todos');
    setClientesSearchValue('');
    setClientesPage(0);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão do Sistema</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><p>Carregando...</p></div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="filas">Filas</TabsTrigger>
            <TabsTrigger value="setores">Setores</TabsTrigger>
            <TabsTrigger value="unidades">Unidades</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>

          {/* Tab Filas */}
          <TabsContent value="filas">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Filas</CardTitle>
                    <CardDescription>Gerencie as filas de atendimento do sistema</CardDescription>
                  </div>
                  <Dialog open={filaModalOpen} onOpenChange={setFilaModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingFila(null); setFilaForm({ nome: '', setorId: '', unidadeAtendimentoId: '' }); setErrors({}); }}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Fila
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingFila ? 'Editar Fila' : 'Nova Fila'}</DialogTitle>
                        <DialogDescription>{editingFila ? 'Edite os dados da fila' : 'Preencha os dados da nova fila'}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="fila-nome">Nome da Fila *</Label>
                          <Input id="fila-nome" value={filaForm.nome} onChange={(e)=> setFilaForm(p=>({ ...p, nome: e.target.value }))} placeholder="Digite o nome da fila" className={errors.nome ? 'border-red-500' : ''}/>
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="fila-setor">Setor *</Label>
                          <Select value={filaForm.setorId} onValueChange={(v)=> setFilaForm(p=>({ ...p, setorId: v }))}>
                            <SelectTrigger className={errors.setorId ? 'border-red-500' : ''}><SelectValue placeholder="Selecione um setor"/></SelectTrigger>
                            <SelectContent>{setorOptions.map(s=> <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.setorId && <p className="text-sm text-red-500">{errors.setorId}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="fila-unidade">Unidade de Atendimento *</Label>
                          <Select value={filaForm.unidadeAtendimentoId} onValueChange={(v)=> setFilaForm(p=>({ ...p, unidadeAtendimentoId: v }))}>
                            <SelectTrigger className={errors.unidadeAtendimentoId ? 'border-red-500' : ''}><SelectValue placeholder="Selecione uma unidade"/></SelectTrigger>
                            <SelectContent>{unidadeOptions.map(u=> <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.unidadeAtendimentoId && <p className="text-sm text-red-500">{errors.unidadeAtendimentoId}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={()=> setFilaModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSalvarFila}>{editingFila ? 'Atualizar' : 'Criar'}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col min-w-[180px]">
                      <Label className="mb-1">Tipo de busca</Label>
                      <Select value={filasSearchType} onValueChange={(v:any)=> { setFilasSearchType(v); setFilasPage(0); }}>
                        <SelectTrigger><SelectValue placeholder="Selecione o tipo de busca"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unidade">Por Unidade</SelectItem>
                          <SelectItem value="nome">Por Nome</SelectItem>
                          <SelectItem value="setor">Por Setor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {filasSearchType === 'unidade' && (
                      <div className="flex flex-col min-w-[240px]">
                        <Label className="mb-1">Unidade de Atendimento</Label>
                        <Select value={filasUnidadeId} onValueChange={(v)=> { setFilasUnidadeId(v); setFilasPage(0); }}>
                          <SelectTrigger><SelectValue placeholder="Selecione a unidade"/></SelectTrigger>
                          <SelectContent>
                            {unidadeOptions.map(u=> <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {filasSearchType === 'nome' && (
                      <>
                        <div className="flex flex-col min-w-[240px]">
                          <Label className="mb-1">Unidade (obrigatório)</Label>
                          <Select value={filasUnidadeId} onValueChange={(v)=> { setFilasUnidadeId(v); setFilasPage(0); }}>
                            <SelectTrigger><SelectValue placeholder="Selecione a unidade"/></SelectTrigger>
                            <SelectContent>{unidadeOptions.map(u=> <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col min-w-[240px]">
                          <Label className="mb-1">Nome da Fila</Label>
                          <Input placeholder="Digite parte do nome da fila" value={filasSearchValue} onChange={(e)=> setFilasSearchValue(e.target.value)} />
                        </div>
                      </>
                    )}

                    {filasSearchType === 'setor' && (
                      <>
                        <div className="flex flex-col min-w-[240px]">
                          <Label className="mb-1">Unidade (obrigatório)</Label>
                          <Select value={filasUnidadeId} onValueChange={(v)=> { setFilasUnidadeId(v); setFilasPage(0); }}>
                            <SelectTrigger><SelectValue placeholder="Selecione a unidade"/></SelectTrigger>
                            <SelectContent>{unidadeOptions.map(u=> <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col min-w-[240px]">
                          <Label className="mb-1">Setor</Label>
                          <Select value={filasSetorId} onValueChange={(v)=> setFilasSetorId(v)}>
                            <SelectTrigger><SelectValue placeholder="Selecione o setor"/></SelectTrigger>
                            <SelectContent>{setorOptions.map(s=> <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="flex flex-col min-w-[130px]">
                      <Label className="mb-1">Itens por página</Label>
                      <Select value={String(filasSize)} onValueChange={(v)=> { const s=Number(v); setFilasSize(s); setFilasPage(0); }}>
                        <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pb-1">
                      <Button variant="outline" onClick={handleBuscarFilas}>Buscar</Button>
                    </div>
                  </div>
                </div>

                {(() => { const d = pageDisplay(filasMeta, filasPage); return (
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Página {d.current} de {d.total}</span>
                      <Input type="number" min={1} max={d.total} value={d.current} onChange={(e)=>{
                        const n = Math.min(Math.max(1, Number(e.target.value)||1), d.total);
                        const zero = n-1; setFilasPage(zero); loadFilasPage(zero);
                      }} className="w-20 h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={()=> { setFilasPage(0); loadFilasPage(0); }} disabled={d.current<=1}>Primeira</Button>
                      <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(filasMeta?.page ?? filasPage)-1); setFilasPage(p); loadFilasPage(p);}} disabled={(filasMeta?.page ?? filasPage) <= 0}>Anterior</Button>
                      <Button variant="outline" size="sm" onClick={()=> {const next=(filasMeta?.page ?? filasPage)+1; if (next+1>d.total) return; setFilasPage(next); loadFilasPage(next);}} disabled={((filasMeta?.page ?? filasPage)+1) >= d.total}>Próxima</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const last = d.total-1; setFilasPage(last); loadFilasPage(last); }} disabled={d.current>=d.total}>Última</Button>
                    </div>
                  </div>
                ); })()}

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
                            <Button variant="outline" size="sm" onClick={()=> handleEditarFila(fila)}><Edit className="w-4 h-4"/></Button>
                            <Button variant="outline" size="sm" onClick={()=> handleExcluirFila(fila.id)}><Trash2 className="w-4 h-4"/></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Setores */}
          <TabsContent value="setores">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Setores</CardTitle>
                    <CardDescription>Gerencie os setores de atendimento</CardDescription>
                  </div>
                  <Dialog open={setorModalOpen} onOpenChange={setSetorModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={()=> { setEditingSetor(null); setSetorForm({ nome: '' }); setErrors({}); }}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Setor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingSetor ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
                        <DialogDescription>{editingSetor ? 'Edite os dados do setor' : 'Preencha os dados do novo setor'}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="setor-nome">Nome do Setor *</Label>
                          <Input id="setor-nome" value={setorForm.nome} onChange={(e)=> setSetorForm({ nome: e.target.value })} placeholder="Digite o nome do setor" className={errors.nome ? 'border-red-500' : ''}/>
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={()=> setSetorModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSalvarSetor}>{editingSetor ? 'Atualizar' : 'Criar'}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex flex-col min-w-[150px]">
                    <Label className="mb-1">Tipo de busca</Label>
                    <Select value={setoresSearchType} onValueChange={(v:any)=> setSetoresSearchType(v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="nome">Nome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {setoresSearchType==='nome' && (
                    <div className="flex flex-col min-w-[220px]">
                      <Label className="mb-1">Nome do Setor</Label>
                      <Input placeholder="Digite parte do nome" value={setoresSearchValue} onChange={(e)=> setSetoresSearchValue(e.target.value)}/>
                    </div>
                  )}
                  <div className="flex flex-col min-w-[130px]">
                    <Label className="mb-1">Itens por página</Label>
                    <Select value={String(setoresSize)} onValueChange={(v)=> { const s=Number(v); setSetoresSize(s); setSetoresPage(0); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="pb-1"><Button variant="outline" onClick={handleBuscarSetores}>Buscar</Button></div>
                </div>
                {(() => { const d = pageDisplay(setoresMeta, setoresPage); return (
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Página {d.current} de {d.total}</span>
                      <Input type="number" min={1} max={d.total} value={d.current} onChange={(e)=>{ const n=Math.min(Math.max(1,Number(e.target.value)||1),d.total); const zero=n-1; setSetoresPage(zero); loadSetoresPage(zero); }} className="w-20 h-8"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={()=> { setSetoresPage(0); loadSetoresPage(0); }} disabled={d.current<=1}>Primeira</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const p=Math.max(0,(setoresMeta?.page ?? setoresPage)-1); setSetoresPage(p); loadSetoresPage(p); }} disabled={(setoresMeta?.page ?? setoresPage) <= 0}>Anterior</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const next=(setoresMeta?.page ?? setoresPage)+1; if (next+1>d.total) return; setSetoresPage(next); loadSetoresPage(next); }} disabled={((setoresMeta?.page ?? setoresPage)+1)>=d.total}>Próxima</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const last=d.total-1; setSetoresPage(last); loadSetoresPage(last); }} disabled={d.current>=d.total}>Última</Button>
                    </div>
                  </div>
                ); })()}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {setores.map(setor => (
                      <TableRow key={setor.id}>
                        <TableCell>{setor.nome}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={()=> handleEditarSetor(setor)}><Edit className="w-4 h-4"/></Button>
                            <Button variant="outline" size="sm" onClick={()=> handleExcluirSetor(setor.id)}><Trash2 className="w-4 h-4"/></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Unidades */}
          <TabsContent value="unidades">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Unidades</CardTitle>
                    <CardDescription>Gerencie as unidades de atendimento</CardDescription>
                  </div>
                  <Dialog open={unidadeModalOpen} onOpenChange={setUnidadeModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingUnidade(null); setErrors({}); setUnidadeForm({ nome: '', endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined }, telefones: [] }); }}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Unidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
                        <DialogDescription>{editingUnidade ? 'Edite os dados da unidade' : 'Preencha os dados da nova unidade'}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="unidade-nome">Nome da Unidade *</Label>
                          <Input id="unidade-nome" value={unidadeForm.nome} onChange={(e)=> setUnidadeForm(p=>({ ...p, nome: e.target.value }))} placeholder="Digite o nome da unidade" className={errors.nome ? 'border-red-500' : ''}/>
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="unidade-endereco">Endereço</Label>
                          <Input id="unidade-endereco" value={unidadeForm.endereco.logradouro} onChange={(e)=> setUnidadeForm(p=>({ ...p, endereco: { ...p.endereco, logradouro: e.target.value } }))} placeholder="Digite o logradouro" />
                        </div>
                        <div className="grid gap-2 grid-cols-2">
                          <div>
                            <Label htmlFor="unidade-numero">Número</Label>
                            <Input
                              id="unidade-numero"
                              value={unidadeForm.endereco.numero}
                              onChange={(e)=> setUnidadeForm(p=>({ ...p, endereco: { ...p.endereco, numero: e.target.value } }))}
                              placeholder="Digite o número"
                            />
                          </div>
                          <div>
                            <Label htmlFor="unidade-complemento">Complemento</Label>
                            <Input id="unidade-complemento" value={unidadeForm.endereco.complemento} onChange={(e)=> setUnidadeForm(p=>({ ...p, endereco: { ...p.endereco, complemento: e.target.value } }))} placeholder="Digite o complemento" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="unidade-bairro">Bairro</Label>
                          <Input id="unidade-bairro" value={unidadeForm.endereco.bairro} onChange={(e)=> setUnidadeForm(p=>({ ...p, endereco: { ...p.endereco, bairro: e.target.value } }))} placeholder="Digite o bairro" />
                        </div>
                        <div className="grid gap-2 grid-cols-2">
                          <div>
                            <Label htmlFor="unidade-cidade">Cidade</Label>
                            <Input id="unidade-cidade" value={unidadeForm.endereco.cidade} onChange={(e)=> setUnidadeForm(p=>({ ...p, endereco: { ...p.endereco, cidade: e.target.value } }))} placeholder="Digite a cidade" />
                          </div>
                          <div>
                            <Label htmlFor="unidade-cep">CEP</Label>
                            <Input id="unidade-cep" value={unidadeForm.endereco.cep} onChange={(e)=> setUnidadeForm(p=>({ ...p, endereco: { ...p.endereco, cep: formatCepMask(e.target.value) } }))} placeholder="Ex.: 14460-098" />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="unidade-telefones">Telefones</Label>
                          <div className="flex flex-col gap-2">
                            {unidadeForm.telefones?.map((t, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <Select value={t.tipo} onValueChange={(v) => setUnidadeForm(p => ({ ...p, telefones: (p.telefones || []).map((tel, idx) => idx === i ? { ...tel, tipo: v as TipoTelefone } : tel) }))}>
                                  <SelectTrigger><SelectValue placeholder="Selecione o tipo"/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={TipoTelefone.FIXO}>Fixo</SelectItem>
                                    <SelectItem value={TipoTelefone.CELULAR}>Celular</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input value={t.ddd} onChange={e => setUnidadeForm(p => ({ ...p, telefones: (p.telefones || []).map((tel, idx) => idx === i ? { ...tel, ddd: parseInt(e.target.value || '0', 10) } : tel) }))} placeholder="DDD" className="w-16" />
                                <Input value={t.numero} onChange={e => setUnidadeForm(p => ({ ...p, telefones: (p.telefones || []).map((tel, idx) => idx === i ? { ...tel, numero: parseInt(e.target.value || '0', 10) } : tel) }))} placeholder="Número" className="flex-1" />
                                {(unidadeForm.telefones.length > 1 || (Number(t.ddd) > 0 || Number(t.numero) > 0)) && (
                                  <Button variant="destructive" onClick={() => setUnidadeForm(p => ({ ...p, telefones: p.telefones?.filter((_, idx) => idx !== i) }))}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button variant="outline" onClick={adicionarTelefone}>
                              <Plus className="w-4 h-4 mr-2" /> Adicionar Telefone
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={()=> setUnidadeModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSalvarUnidade}>{editingUnidade ? 'Atualizar' : 'Criar'}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex flex-col min-w-[150px]">
                    <Label className="mb-1">Tipo de busca</Label>
                    <Select value={unidadesSearchType} onValueChange={(v:any)=> setUnidadesSearchType(v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="nome">Nome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {unidadesSearchType==='nome' && (
                    <div className="flex flex-col min-w-[220px]">
                      <Label className="mb-1">Nome da Unidade</Label>
                      <Input placeholder="Digite parte do nome" value={unidadesSearchValue} onChange={(e)=> setUnidadesSearchValue(e.target.value)}/>
                    </div>
                  )}
                  <div className="flex flex-col min-w-[130px]">
                    <Label className="mb-1">Itens por página</Label>
                    <Select value={String(unidadesSize)} onValueChange={(v)=> { const s=Number(v); setUnidadesSize(s); setUnidadesPage(0); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="pb-1"><Button variant="outline" onClick={handleBuscarUnidades}>Buscar</Button></div>
                </div>
                {(() => { const d = pageDisplay(unidadesMeta, unidadesPage); return (
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Página {d.current} de {d.total}</span>
                      <Input type="number" min={1} max={d.total} value={d.current} onChange={(e)=>{ const n=Math.min(Math.max(1,Number(e.target.value)||1),d.total); const zero=n-1; setUnidadesPage(zero); loadUnidadesPage(zero); }} className="w-20 h-8"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={()=> { setUnidadesPage(0); loadUnidadesPage(0); }} disabled={d.current<=1}>Primeira</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const p=Math.max(0,(unidadesMeta?.page ?? unidadesPage)-1); setUnidadesPage(p); loadUnidadesPage(p); }} disabled={(unidadesMeta?.page ?? unidadesPage) <= 0}>Anterior</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const next=(unidadesMeta?.page ?? unidadesPage)+1; if (next+1>d.total) return; setUnidadesPage(next); loadUnidadesPage(next); }} disabled={((unidadesMeta?.page ?? unidadesPage)+1)>=d.total}>Próxima</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const last=d.total-1; setUnidadesPage(last); loadUnidadesPage(last); }} disabled={d.current>=d.total}>Última</Button>
                    </div>
                  </div>
                ); })()}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Telefones</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unidades.map(unidade => (
                      <TableRow key={unidade.id}>
                        <TableCell>{unidade.nome}</TableCell>
                        <TableCell>{unidade.endereco?.enderecoFormatado || `${unidade.endereco?.logradouro}, ${unidade.endereco?.numero}` || 'Não informado'}</TableCell>
                        <TableCell>{unidade.telefones?.map((t,i)=> <div key={i} className="text-sm">{t.tipo}: ({t.ddd}) {t.numero}</div>) || 'Nenhum'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={()=> handleEditarUnidade(unidade)}><Edit className="w-4 h-4"/></Button>
                            <Button variant="outline" size="sm" onClick={()=> handleExcluirUnidade(unidade.id)}><Trash2 className="w-4 h-4"/></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Usuários */}
          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Usuários</CardTitle>
                    <CardDescription>Gerencie os usuários do sistema</CardDescription>
                  </div>
                  <Dialog open={usuarioModalOpen} onOpenChange={setUsuarioModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingUsuario(null); setErrors({}); setUsuarioForm({ nomeUsuario: '', email: '', senha: '', categoria: CategoriaUsuario.USUARIO, unidadesIds: [] }); }}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                        <DialogDescription>{editingUsuario ? 'Edite os dados do usuário' : 'Preencha os dados do novo usuário'}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="usuario-nome">Nome do Usuário *</Label>
                          <Input id="usuario-nome" value={usuarioForm.nomeUsuario} onChange={(e)=> setUsuarioForm(p=>({ ...p, nomeUsuario: e.target.value }))} placeholder="Digite o nome do usuário" className={errors.nomeUsuario ? 'border-red-500' : ''}/>
                          {errors.nomeUsuario && <p className="text-sm text-red-500">{errors.nomeUsuario}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="usuario-email">Email *</Label>
                          <Input id="usuario-email" value={usuarioForm.email} onChange={(e)=> setUsuarioForm(p=>({ ...p, email: e.target.value }))} placeholder="Digite o email" className={errors.email ? 'border-red-500' : ''}/>
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="usuario-senha">Senha {editingUsuario ? '' : '*'} </Label>
                          <Input id="usuario-senha" type="password" value={usuarioForm.senha} onChange={(e)=> setUsuarioForm(p=>({ ...p, senha: e.target.value }))} placeholder="Digite a senha" className={errors.senha ? 'border-red-500' : ''}/>
                          {errors.senha && <p className="text-sm text-red-500">{errors.senha}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="usuario-categoria">Categoria *</Label>
                          <Select value={usuarioForm.categoria} onValueChange={(v)=> setUsuarioForm(p=>({ ...p, categoria: v as CategoriaUsuario }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione a categoria"/></SelectTrigger>
                            <SelectContent>
                              <SelectItem value={CategoriaUsuario.ADMINISTRADOR}>Administrador</SelectItem>
                              <SelectItem value={CategoriaUsuario.USUARIO}>Usuário Comum</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Unidades de Acesso</Label>
                          <div className="space-y-2">
                            {unidadeOptions.map(u => (
                              <div key={u.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`unidade-${u.id}`}
                                  checked={usuarioForm.unidadesIds?.includes(u.id) || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setUsuarioForm(prev => ({ ...prev, unidadesIds: [...(prev.unidadesIds || []), u.id] }));
                                    } else {
                                      setUsuarioForm(prev => ({ ...prev, unidadesIds: (prev.unidadesIds || []).filter(id => id !== u.id) }));
                                    }
                                  }}
                                />
                                <Label htmlFor={`unidade-${u.id}`}>{u.nome}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={()=> setUsuarioModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSalvarUsuario}>{editingUsuario ? 'Atualizar' : 'Criar'}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex flex-col min-w-[150px]">
                    <Label className="mb-1">Tipo de busca</Label>
                    <Select value={usuariosSearchType} onValueChange={(v:any)=> setUsuariosSearchType(v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="nome">Nome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {usuariosSearchType!=='todos' && (
                    <div className="flex flex-col min-w-[220px]">
                      <Label className="mb-1">{usuariosSearchType==='email' ? 'Email' : 'Nome'}</Label>
                      <Input placeholder={usuariosSearchType==='email' ? 'usuario@email.com' : 'Digite parte do nome'} value={usuariosSearchValue} onChange={(e)=> setUsuariosSearchValue(e.target.value)}/>
                    </div>
                  )}
                  <div className="flex flex-col min-w-[130px]">
                    <Label className="mb-1">Itens por página</Label>
                    <Select value={String(usuariosSize)} onValueChange={(v)=> { const s=Number(v); setUsuariosSize(s); setUsuariosPage(0); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="pb-1"><Button variant="outline" onClick={handleBuscarUsuarios}>Buscar</Button></div>
                </div>

                {(() => { const d = pageDisplay(usuariosMeta, usuariosPage); return (
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Página {d.current} de {d.total}</span>
                      <Input type="number" min={1} max={d.total} value={d.current} onChange={(e)=>{ const n=Math.min(Math.max(1,Number(e.target.value)||1),d.total); const zero=n-1; setUsuariosPage(zero); loadUsuariosPage(zero); }} className="w-20 h-8"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={()=> { setUsuariosPage(0); loadUsuariosPage(0); }} disabled={d.current<=1}>Primeira</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const p=Math.max(0,(usuariosMeta?.page ?? usuariosPage)-1); setUsuariosPage(p); loadUsuariosPage(p); }} disabled={(usuariosMeta?.page ?? usuariosPage)<=0}>Anterior</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const next=(usuariosMeta?.page ?? usuariosPage)+1; if (next+1>d.total) return; setUsuariosPage(next); loadUsuariosPage(next); }} disabled={((usuariosMeta?.page ?? usuariosPage)+1)>=d.total}>Próxima</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const last=d.total-1; setUsuariosPage(last); loadUsuariosPage(last); }} disabled={d.current>=d.total}>Última</Button>
                    </div>
                  </div>
                ); })()}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Unidades</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map(usuario => (
                      <TableRow key={usuario.id}>
                        <TableCell>{usuario.nomeUsuario}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.categoria === CategoriaUsuario.ADMINISTRADOR ? 'default' : 'secondary'}>
                            {usuario.categoria === CategoriaUsuario.ADMINISTRADOR ? (<>Admin</>) : (<>Usuário</>)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ScrollArea className="max-h-16 w-full">
                            <div className="flex flex-wrap gap-1">
                              {(usuario.unidadesIds || []).map((uid)=> {
                                const nome = unidadeOptions.find(u=> u.id===uid)?.nome || uid;
                                return <Badge key={uid} variant="secondary" className="whitespace-nowrap">{nome}</Badge>;
                              })}
                            </div>
                          </ScrollArea>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={()=> handleEditarUsuario(usuario)}><Edit className="w-4 h-4"/></Button>
                            {usuario.categoria !== CategoriaUsuario.ADMINISTRADOR && (
                              <Button variant="outline" size="sm" onClick={()=> handlePromoverUsuario(usuario.id)}><UserPlus className="w-4 h-4"/></Button>
                            )}
                            <Button variant="outline" size="sm" onClick={()=> handleExcluirUsuario(usuario.id)}><Trash2 className="w-4 h-4"/></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Clientes */}
          <TabsContent value="clientes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Clientes</CardTitle>
                    <CardDescription>Cadastre e edite clientes</CardDescription>
                  </div>
                  <Dialog open={clienteModalOpen} onOpenChange={setClienteModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={()=> { setEditingCliente(null); setErrors({}); setClienteForm({ cpf: '', nome: '', email: '', telefones: [ { tipo: TipoTelefone.CELULAR, ddd: 16, numero: 0 } ], endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined } }); }}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                        <DialogDescription>{editingCliente ? 'Edite os dados do cliente' : 'Preencha os dados do novo cliente'}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-cpf">CPF *</Label>
                          <Input id="cliente-cpf" value={clienteForm.cpf} onChange={(e)=> setClienteForm(p=>({ ...p, cpf: e.target.value }))} placeholder="Digite o CPF" className={errors.cpf ? 'border-red-500' : ''}/>
                          {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-nome">Nome *</Label>
                          <Input id="cliente-nome" value={clienteForm.nome} onChange={(e)=> setClienteForm(p=>({ ...p, nome: e.target.value }))} placeholder="Digite o nome" className={errors.nome ? 'border-red-500' : ''}/>
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-email">Email</Label>
                          <Input id="cliente-email" value={clienteForm.email} onChange={(e)=> setClienteForm(p=>({ ...p, email: e.target.value }))} placeholder="Digite o email" className={errors.email ? 'border-red-500' : ''}/>
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="cliente-endereco">Endereço</Label>
                          <Input id="cliente-endereco" value={clienteForm.endereco.logradouro} onChange={(e)=> setClienteForm(p=>({ ...p, endereco: { ...p.endereco, logradouro: e.target.value } }))} placeholder="Digite o logradouro" />
                        </div>
                        <div className="flex gap-2">
                          <div className="shrink-0">
                            <Label htmlFor="cliente-numero">Número</Label>
                            <Input
                              id="cliente-numero"
                              value={clienteForm.endereco.numero}
                              onChange={(e)=> setClienteForm(p=>({ ...p, endereco: { ...p.endereco, numero: e.target.value.replace(/[^0-9]/g,'').slice(0,6) } }))}
                              placeholder="Ex.: 123456"
                              maxLength={6}
                              inputMode="numeric"
                              pattern="\\d*"
                              className="w-28"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="cliente-complemento">Complemento</Label>
                            <Input id="cliente-complemento" value={clienteForm.endereco.complemento} onChange={(e)=> setClienteForm(p=>({ ...p, endereco: { ...p.endereco, complemento: e.target.value } }))} placeholder="Ex.: Apto 12, Bloco B" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-bairro">Bairro</Label>
                          <Input id="cliente-bairro" value={clienteForm.endereco.bairro} onChange={(e)=> setClienteForm(p=>({ ...p, endereco: { ...p.endereco, bairro: e.target.value } }))} placeholder="Digite o bairro" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="cliente-cidade">Cidade</Label>
                            <Input id="cliente-cidade" value={clienteForm.endereco.cidade} onChange={(e)=> setClienteForm(p=>({ ...p, endereco: { ...p.endereco, cidade: e.target.value } }))} placeholder="Ex.: Cristais Paulista" />
                          </div>
                          <div className="shrink-0">
                            <Label htmlFor="cliente-cep">CEP</Label>
                            <Input
                              id="cliente-cep"
                              value={clienteForm.endereco.cep}
                              onChange={(e)=> setClienteForm(p=>({ ...p, endereco: { ...p.endereco, cep: formatCepMask(e.target.value) } }))}
                              placeholder="Ex.: 14460-098"
                              maxLength={9}
                              inputMode="numeric"
                              pattern="\\d{5}-?\\d{0,3}"
                              className="w-32"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="cliente-telefones">Telefones</Label>
                          <div className="flex flex-col gap-2">
                            {clienteForm.telefones?.map((t, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <Select value={t.tipo} onValueChange={(v) => setClienteForm(p => ({ ...p, telefones: (p.telefones || []).map((tel, idx) => idx === i ? { ...tel, tipo: v as TipoTelefone } : tel) }))}>
                                  <SelectTrigger className="w-28"><SelectValue placeholder="Tipo"/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={TipoTelefone.FIXO}>Fixo</SelectItem>
                                    <SelectItem value={TipoTelefone.CELULAR}>Celular</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={String(t.ddd ?? '')}
                                  onChange={e => setClienteForm(p => ({ ...p, telefones: (p.telefones || []).map((tel, idx) => idx === i ? { ...tel, ddd: parseInt(e.target.value.replace(/[^0-9]/g,'').slice(0,2) || '0', 10) } : tel) }))}
                                  placeholder="DDD (ex.: 16)"
                                  className="w-16"
                                  maxLength={2}
                                  inputMode="numeric"
                                  pattern="\\d*"
                                />
                                <Input
                                  value={String(t.numero ?? '')}
                                  onChange={e => setClienteForm(p => ({ ...p, telefones: (p.telefones || []).map((tel, idx) => idx === i ? { ...tel, numero: parseInt(e.target.value.replace(/[^0-9]/g,'').slice(0,11) || '0', 10) } : tel) }))}
                                  placeholder="Número (ex.: 98836-2410)"
                                  className="flex-1"
                                  maxLength={11}
                                  inputMode="numeric"
                                  pattern="\\d*"
                                />
                                {(clienteForm.telefones.length > 1 || (Number(t.ddd) > 0 || Number(t.numero) > 0)) && (
                                  <Button variant="destructive" onClick={() => setClienteForm(p => ({ ...p, telefones: p.telefones?.filter((_, idx) => idx !== i) }))}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button variant="outline" onClick={()=> setClienteForm(p => ({ ...p, telefones: [...(p.telefones || []), { tipo: TipoTelefone.CELULAR, ddd: 0, numero: 0 }] }))}>
                              <Plus className="w-4 h-4 mr-2" /> Adicionar Telefone
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={()=> setClienteModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSalvarCliente}>{editingCliente ? 'Atualizar' : 'Criar'}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex flex-col min-w-[150px]">
                    <Label className="mb-1">Tipo de busca</Label>
                    <Select value={clientesSearchType} onValueChange={(v:any)=> setClientesSearchType(v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="nome">Nome</SelectItem>
                        <SelectItem value="cpf">Cpf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {clientesSearchType!=='todos' && (
                    <div className="flex flex-col min-w-[220px]">
                      <Label className="mb-1">{clientesSearchType==='nome' ? 'Nome' : 'CPF'}</Label>
                      <Input placeholder={clientesSearchType==='nome' ? 'Digite parte do nome' : '000.000.000-00'} value={clientesSearchValue} onChange={(e)=> setClientesSearchValue(e.target.value)}/>
                    </div>
                  )}
                  <div className="flex flex-col min-w-[130px]">
                    <Label className="mb-1">Itens por página</Label>
                    <Select value={String(clientesSize)} onValueChange={(v)=> { const s=Number(v); setClientesSize(s); setClientesPage(0); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                      <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="pb-1"><Button variant="outline" onClick={handleBuscarClientes}>Buscar</Button></div>
                </div>

                {(() => { const d = pageDisplay(clientesMeta, clientesPage); return (
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Página {d.current} de {d.total}</span>
                      <Input type="number" min={1} max={d.total} value={d.current} onChange={(e)=>{ const n=Math.min(Math.max(1,Number(e.target.value)||1),d.total); const zero=n-1; setClientesPage(zero); loadClientesPage(zero); }} className="w-20 h-8"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={()=> { setClientesPage(0); loadClientesPage(0); }} disabled={d.current<=1}>Primeira</Button>
                      <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(clientesMeta?.page ?? clientesPage)-1); setClientesPage(p); loadClientesPage(p);}} disabled={(clientesMeta?.page ?? clientesPage) <= 0}>Anterior</Button>
                      <Button variant="outline" size="sm" onClick={()=> {const next=(clientesMeta?.page ?? clientesPage)+1; if (next+1>d.total) return; setClientesPage(next); loadClientesPage(next);}} disabled={((clientesMeta?.page ?? clientesPage)+1) >= d.total}>Próxima</Button>
                      <Button variant="outline" size="sm" onClick={()=> { const last = d.total-1; setClientesPage(last); loadClientesPage(last); }} disabled={d.current>=d.total}>Última</Button>
                    </div>
                  </div>
                ); })()}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefones</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map(cliente => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell>{cliente.cpf}</TableCell>
                        <TableCell>{cliente.email || '-'}</TableCell>
                        <TableCell>
                          {cliente.telefones && cliente.telefones.length>0 ? (
                            <div className="space-y-1">{cliente.telefones.map((t,i)=> <div key={i} className="text-sm">{t.tipo}: ({t.ddd}) {t.numero}</div>)}</div>
                          ) : 'Nenhum'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={()=> handleEditarCliente(cliente)}><Edit className="w-4 h-4"/></Button>
                            <Button variant="outline" size="sm" onClick={()=> handleExcluirCliente(cliente.id)}><Trash2 className="w-4 h-4"/></Button>
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
      )}
    </div>
  );
}

export default Gestao;

