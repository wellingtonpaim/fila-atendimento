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
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  UserPlus,
  Shield,
  ShieldCheck
} from 'lucide-react';

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
  FilaUpdateDTO,
  SetorCreateDTO,
  SetorResponseDTO,
  UnidadeAtendimentoCreateDTO,
  UnidadeAtendimentoResponseDTO,
  UnidadeAtendimentoUpdateDTO,
  UsuarioCreateDTO,
  UsuarioResponseDTO,
  UsuarioUpdateDTO,
  CategoriaUsuario,
  TipoTelefone,
  UF,
  Telefone,
  ClienteCreateDTO,
  ClienteResponseDTO,
  ClienteUpdateDTO
} from '@/types';

interface FormErrors {
  [key: string]: string;
}

// Helper: base URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

// Helper: metadados de paginação
interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const Gestao = () => {
  const { toast } = useToast();

  // Estados para dados
  const [filas, setFilas] = useState<FilaResponseDTO[]>([]);
  const [setores, setSetores] = useState<SetorResponseDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeAtendimentoResponseDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);

  // Estados para loading
  const [loading, setLoading] = useState(false);

  // Estados para modais
  const [filaModalOpen, setFilaModalOpen] = useState(false);
  const [setorModalOpen, setSetorModalOpen] = useState(false);
  const [unidadeModalOpen, setUnidadeModalOpen] = useState(false);
  const [usuarioModalOpen, setUsuarioModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);

  // Estados para edição
  const [editingFila, setEditingFila] = useState<FilaResponseDTO | null>(null);
  const [editingSetor, setEditingSetor] = useState<SetorResponseDTO | null>(null);
  const [editingUnidade, setEditingUnidade] = useState<UnidadeAtendimentoResponseDTO | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioResponseDTO | null>(null);
  const [editingCliente, setEditingCliente] = useState<ClienteResponseDTO | null>(null);

  // Estados para formulários
  const [filaForm, setFilaForm] = useState<FilaCreateDTO>({
    nome: '',
    setorId: '',
    unidadeAtendimentoId: ''
  });

  const [setorForm, setSetorForm] = useState<SetorCreateDTO>({
    nome: ''
  });

  const [unidadeForm, setUnidadeForm] = useState<UnidadeAtendimentoCreateDTO>({
    nome: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      cep: '',
      uf: undefined
    },
    telefones: []
  });

  const [usuarioForm, setUsuarioForm] = useState<UsuarioCreateDTO>({
    nomeUsuario: '',
    email: '',
    senha: '',
    categoria: CategoriaUsuario.USUARIO,
    unidadesIds: []
  });
  const [clienteForm, setClienteForm] = useState<ClienteCreateDTO>({
    cpf: '',
    nome: '',
    email: '',
    telefones: [],
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      cep: '',
      uf: undefined
    }
  });

  // Estados para telefones temporários na unidade
  const [telefoneTemp, setTelefoneTemp] = useState<Telefone>({
    tipo: TipoTelefone.FIXO,
    ddd: 11,
    numero: 0
  });
  const [telefoneClienteTemp, setTelefoneClienteTemp] = useState<Telefone>({
    tipo: TipoTelefone.CELULAR,
    ddd: 11,
    numero: 0
  });

  // Estados para erros de validação
  const [errors, setErrors] = useState<FormErrors>({});

  // ===== Estados de paginação e busca =====
  // Filas
  const [filasPage, setFilasPage] = useState(0);
  const [filasSize, setFilasSize] = useState(10);
  const [filasMeta, setFilasMeta] = useState<PaginationMeta | null>(null);
  const [filasUnidadeId, setFilasUnidadeId] = useState<string>('');

  // Setores
  const [setoresPage, setSetoresPage] = useState(0);
  const [setoresSize, setSetoresSize] = useState(10);
  const [setoresMeta, setSetoresMeta] = useState<PaginationMeta | null>(null);
  const [setoresSearchType, setSetoresSearchType] = useState<'todos' | 'nome'>('todos');
  const [setoresSearchValue, setSetoresSearchValue] = useState('');

  // Unidades
  const [unidadesPage, setUnidadesPage] = useState(0);
  const [unidadesSize, setUnidadesSize] = useState(10);
  const [unidadesMeta, setUnidadesMeta] = useState<PaginationMeta | null>(null);
  const [unidadesSearchType, setUnidadesSearchType] = useState<'todos' | 'nome'>('todos');
  const [unidadesSearchValue, setUnidadesSearchValue] = useState('');

  // Usuários
  const [usuariosPage, setUsuariosPage] = useState(0);
  const [usuariosSize, setUsuariosSize] = useState(10);
  const [usuariosMeta, setUsuariosMeta] = useState<PaginationMeta | null>(null);
  const [usuariosSearchType, setUsuariosSearchType] = useState<'todos' | 'email'>('todos');
  const [usuariosSearchValue, setUsuariosSearchValue] = useState('');

  // Clientes
  const [clientesPage, setClientesPage] = useState(0);
  const [clientesSize, setClientesSize] = useState(10);
  const [clientesMeta, setClientesMeta] = useState<PaginationMeta | null>(null);
  const [clientesSearchType, setClientesSearchType] = useState<'todos' | 'nome' | 'cpf'>('todos');
  const [clientesSearchValue, setClientesSearchValue] = useState('');

  // Opções completas para selects (sem paginação)
  const [unidadeOptions, setUnidadeOptions] = useState<UnidadeAtendimentoResponseDTO[]>([]);
  const [setorOptions, setSetorOptions] = useState<SetorResponseDTO[]>([]);

  // Helper: GET paginado com headers
  async function getPaginated<T>(path: string, params?: Record<string, string | number>): Promise<{ data: T; meta: PaginationMeta | null; }> {
    const url = new URL(`${API_BASE_URL}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    const res = await fetch(url.toString(), { headers: authService.getAuthHeaders() });
    if (!res.ok) throw new Error(res.statusText);
    const totalCount = Number(res.headers.get('X-Total-Count'));
    const totalPages = Number(res.headers.get('X-Total-Pages'));
    const page = Number(res.headers.get('X-Page'));
    const pageSize = Number(res.headers.get('X-Page-Size'));
    const meta = isFinite(totalCount) && isFinite(totalPages) && isFinite(page) && isFinite(pageSize)
      ? { totalCount, totalPages, page, pageSize }
      : null;
    const body = await res.json(); // ApiResponse<T>
    return { data: body.data as T, meta };
  }

  // Loaders por aba com paginação e busca
  const loadFilasPage = async (page = filasPage, size = filasSize, unidadeId = filasUnidadeId) => {
    if (!unidadeId) {
      setFilas([]); setFilasMeta(null); return;
    }
    try {
      const { data, meta } = await getPaginated<FilaResponseDTO[]>(`/api/filas/unidade/${unidadeId}`, { page, size });
      setFilas(data || []);
      setFilasMeta(meta);
      setFilasPage(meta?.page ?? page);
      setFilasSize(meta?.pageSize ?? size);
    } catch (e) {
      setFilas([]); setFilasMeta(null);
    }
  };

  const loadSetoresPage = async (page = setoresPage, size = setoresSize) => {
    try {
      if (setoresSearchType === 'nome' && setoresSearchValue.trim()) {
        const { data, meta } = await getPaginated<SetorResponseDTO[]>(`/api/setores/nome/${encodeURIComponent(setoresSearchValue)}`, { page, size });
        setSetores(data || []); setSetoresMeta(meta); setSetoresPage(meta?.page ?? page); setSetoresSize(meta?.pageSize ?? size);
      } else {
        const { data, meta } = await getPaginated<SetorResponseDTO[]>(`/api/setores`, { page, size });
        setSetores(data || []); setSetoresMeta(meta); setSetoresPage(meta?.page ?? page); setSetoresSize(meta?.pageSize ?? size);
      }
    } catch {
      setSetores([]); setSetoresMeta(null);
    }
  };

  const loadUnidadesPage = async (page = unidadesPage, size = unidadesSize) => {
    try {
      if (unidadesSearchType === 'nome' && unidadesSearchValue.trim()) {
        const { data, meta } = await getPaginated<UnidadeAtendimentoResponseDTO[]>(`/api/unidades-atendimento/nome/${encodeURIComponent(unidadesSearchValue)}`, { page, size });
        setUnidades(data || []); setUnidadesMeta(meta); setUnidadesPage(meta?.page ?? page); setUnidadesSize(meta?.pageSize ?? size);
      } else {
        const { data, meta } = await getPaginated<UnidadeAtendimentoResponseDTO[]>(`/api/unidades-atendimento`, { page, size });
        setUnidades(data || []); setUnidadesMeta(meta); setUnidadesPage(meta?.page ?? page); setUnidadesSize(meta?.pageSize ?? size);
      }
    } catch {
      setUnidades([]); setUnidadesMeta(null);
    }
  };

  const loadUsuariosPage = async (page = usuariosPage, size = usuariosSize) => {
    try {
      if (usuariosSearchType === 'email' && usuariosSearchValue.trim()) {
        const res = await fetch(`${API_BASE_URL}/api/usuarios/email/${encodeURIComponent(usuariosSearchValue)}`, { headers: authService.getAuthHeaders() });
        if (res.ok) {
          const body = await res.json(); // ApiResponse<UsuarioResponseDTO>
          const item = body.data as UsuarioResponseDTO;
          setUsuarios(item ? [item] : []);
          setUsuariosMeta({ totalCount: item ? 1 : 0, totalPages: 1, page: 0, pageSize: 1 });
          setUsuariosPage(0); setUsuariosSize(1);
        } else { setUsuarios([]); setUsuariosMeta({ totalCount: 0, totalPages: 0, page: 0, pageSize: size }); }
      } else {
        const { data, meta } = await getPaginated<UsuarioResponseDTO[]>(`/api/usuarios`, { page, size });
        setUsuarios(data || []); setUsuariosMeta(meta); setUsuariosPage(meta?.page ?? page); setUsuariosSize(meta?.pageSize ?? size);
      }
    } catch {
      setUsuarios([]); setUsuariosMeta(null);
    }
  };

  const loadClientesPage = async (page = clientesPage, size = clientesSize) => {
    try {
      if (clientesSearchType === 'nome' && clientesSearchValue.trim()) {
        const { data, meta } = await getPaginated<ClienteResponseDTO[]>(`/api/clientes/nome/${encodeURIComponent(clientesSearchValue)}`, { page, size });
        setClientes(data || []); setClientesMeta(meta); setClientesPage(meta?.page ?? page); setClientesSize(meta?.pageSize ?? size);
      } else if (clientesSearchType === 'cpf' && clientesSearchValue.trim()) {
        const res = await fetch(`${API_BASE_URL}/api/clientes/cpf/${encodeURIComponent(clientesSearchValue)}`, { headers: authService.getAuthHeaders() });
        if (res.ok) {
          const body = await res.json();
          const item = body.data as ClienteResponseDTO;
          setClientes(item ? [item] : []);
          setClientesMeta({ totalCount: item ? 1 : 0, totalPages: 1, page: 0, pageSize: 1 });
          setClientesPage(0); setClientesSize(1);
        } else { setClientes([]); setClientesMeta({ totalCount: 0, totalPages: 0, page: 0, pageSize: size }); }
      } else {
        const { data, meta } = await getPaginated<ClienteResponseDTO[]>(`/api/clientes`, { page, size });
        setClientes(data || []); setClientesMeta(meta); setClientesPage(meta?.page ?? page); setClientesSize(meta?.pageSize ?? size);
      }
    } catch {
      setClientes([]); setClientesMeta(null);
    }
  };

  // Carregamento inicial dos dados
  useEffect(() => {
    carregarDados();
  }, []);

  // ===== Ajuste do carregarDados inicial =====
  const carregarDados = async () => {
    setLoading(true);
    try {
      // opções completas para selects (sem paginação)
      const [setoresAll, unidadesAll] = await Promise.all([
        setorService.listarTodos(),
        unidadeService.listarTodas()
      ]);
      setSetorOptions(setoresAll.data || []);
      setUnidadeOptions(unidadesAll.data || []);

      // definir unidade padrão para Filas
      const defaultUnid = (unidadesAll.data && unidadesAll.data[0]?.id) || '';
      setFilasUnidadeId(prev => prev || defaultUnid);

      // carregar listagens paginadas iniciais
      await Promise.all([
        loadSetoresPage(0, setoresSize),
        loadUnidadesPage(0, unidadesSize),
        loadUsuariosPage(0, usuariosSize),
        loadClientesPage(0, clientesSize)
      ]);
      // Filas depende do unidadeId setado acima
      await loadFilasPage(0, filasSize, defaultUnid);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setFilas([]); setSetores([]); setUnidades([]); setUsuarios([]); setClientes([]);
      setFilasMeta(null); setSetoresMeta(null); setUnidadesMeta(null); setUsuariosMeta(null); setClientesMeta(null);
      toast({ title: 'Erro', description: 'Erro ao carregar dados.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Validação de formulários
  const validarFilaForm = (form: FilaCreateDTO): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nome || form.nome.length < 3 || form.nome.length > 50) {
      errors.nome = 'Nome deve ter entre 3 e 50 caracteres';
    }
    if (!form.setorId) {
      errors.setorId = 'Setor é obrigatório';
    }
    if (!form.unidadeAtendimentoId) {
      errors.unidadeAtendimentoId = 'Unidade de Atendimento é obrigatória';
    }
    return errors;
  };

  const validarSetorForm = (form: SetorCreateDTO): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nome || form.nome.length < 3 || form.nome.length > 50) {
      errors.nome = 'Nome deve ter entre 3 e 50 caracteres';
    }
    return errors;
  };

  const validarUnidadeForm = (form: UnidadeAtendimentoCreateDTO): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nome || form.nome.length < 3 || form.nome.length > 100) {
      errors.nome = 'Nome deve ter entre 3 e 100 caracteres';
    }
    if (form.endereco?.logradouro && !form.endereco.logradouro.trim()) {
      errors.logradouro = 'Logradouro não pode ser vazio';
    }
    if (form.endereco?.numero && !form.endereco.numero.trim()) {
      errors.numero = 'Número não pode ser vazio';
    }
    return errors;
  };

  const validarUsuarioForm = (form: UsuarioCreateDTO): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nomeUsuario || form.nomeUsuario.length < 3) {
      errors.nomeUsuario = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email deve ter um formato válido';
    }
    if (!editingUsuario && (!form.senha || form.senha.length < 6)) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    return errors;
  };

  const validarClienteForm = (form: ClienteCreateDTO): FormErrors => {
    const errors: FormErrors = {};
    if (!form.cpf || !form.cpf.trim()) errors.cpf = 'CPF é obrigatório';
    if (!form.nome || form.nome.length < 3 || form.nome.length > 100) errors.nome = 'Nome deve ter entre 3 e 100 caracteres';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido';
    if (form.endereco) {
      if (form.endereco.logradouro !== undefined && !form.endereco.logradouro.trim()) errors.logradouro = 'Logradouro não pode ser vazio';
      if (form.endereco.numero !== undefined && !form.endereco.numero.trim()) errors.numero = 'Número não pode ser vazio';
    }
    return errors;
  };

  // Funções para manipular filas
  const handleSalvarFila = async () => {
    const validationErrors = validarFilaForm(filaForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingFila) {
        const updateData: FilaUpdateDTO = {
          nome: filaForm.nome,
          setorId: filaForm.setorId,
          unidadeAtendimentoId: filaForm.unidadeAtendimentoId
        };
        await filaService.atualizarParcialmente(editingFila.id, updateData);
        toast({
          title: "Sucesso",
          description: "Fila atualizada com sucesso"
        });
      } else {
        await filaService.criar(filaForm);
        toast({
          title: "Sucesso",
          description: "Fila criada com sucesso"
        });
      }

      setFilaModalOpen(false);
      resetFilaForm();
      carregarDados();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar fila",
        variant: "destructive"
      });
    }
  };

  const handleEditarFila = (fila: FilaResponseDTO) => {
    setEditingFila(fila);
    setFilaForm({
      nome: fila.nome,
      setorId: fila.setor.id,
      unidadeAtendimentoId: fila.unidade.id
    });
    setFilaModalOpen(true);
  };

  const handleExcluirFila = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta fila?')) {
      try {
        await filaService.desativar(id);
        toast({
          title: "Sucesso",
          description: "Fila excluída com sucesso"
        });
        carregarDados();
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir fila",
          variant: "destructive"
        });
      }
    }
  };

  const resetFilaForm = () => {
    setFilaForm({
      nome: '',
      setorId: '',
      unidadeAtendimentoId: ''
    });
    setEditingFila(null);
    setErrors({});
  };

  // Funções para manipular setores
  const handleSalvarSetor = async () => {
    const validationErrors = validarSetorForm(setorForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingSetor) {
        await setorService.substituir(editingSetor.id, setorForm);
        toast({
          title: "Sucesso",
          description: "Setor atualizado com sucesso"
        });
      } else {
        await setorService.criar(setorForm);
        toast({
          title: "Sucesso",
          description: "Setor criado com sucesso"
        });
      }

      setSetorModalOpen(false);
      resetSetorForm();
      carregarDados();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar setor",
        variant: "destructive"
      });
    }
  };

  const handleEditarSetor = (setor: SetorResponseDTO) => {
    setEditingSetor(setor);
    setSetorForm({
      nome: setor.nome
    });
    setSetorModalOpen(true);
  };

  const handleExcluirSetor = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        await setorService.desativar(id);
        toast({
          title: "Sucesso",
          description: "Setor excluído com sucesso"
        });
        carregarDados();
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir setor",
          variant: "destructive"
        });
      }
    }
  };

  const resetSetorForm = () => {
    setSetorForm({ nome: '' });
    setEditingSetor(null);
    setErrors({});
  };

  // Funções para manipular unidades
  const handleSalvarUnidade = async () => {
    const validationErrors = validarUnidadeForm(unidadeForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingUnidade) {
        const updateData: UnidadeAtendimentoUpdateDTO = {
          nome: unidadeForm.nome,
          endereco: unidadeForm.endereco,
          telefones: unidadeForm.telefones
        };
        await unidadeService.atualizarParcialmente(editingUnidade.id, updateData);
        toast({
          title: "Sucesso",
          description: "Unidade atualizada com sucesso"
        });
      } else {
        await unidadeService.criar(unidadeForm);
        toast({
          title: "Sucesso",
          description: "Unidade criada com sucesso"
        });
      }

      setUnidadeModalOpen(false);
      resetUnidadeForm();
      carregarDados();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar unidade",
        variant: "destructive"
      });
    }
  };

  const handleEditarUnidade = (unidade: UnidadeAtendimentoResponseDTO) => {
    setEditingUnidade(unidade);
    setUnidadeForm({
      nome: unidade.nome,
      endereco: unidade.endereco || {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        cep: '',
        uf: undefined
      },
      telefones: unidade.telefones || []
    });
    setUnidadeModalOpen(true);
  };

  const handleExcluirUnidade = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        await unidadeService.desativar(id);
        toast({
          title: "Sucesso",
          description: "Unidade excluída com sucesso"
        });
        carregarDados();
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir unidade",
          variant: "destructive"
        });
      }
    }
  };

  const resetUnidadeForm = () => {
    setUnidadeForm({
      nome: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        cep: '',
        uf: undefined
      },
      telefones: []
    });
    setEditingUnidade(null);
    setErrors({});
  };

  const adicionarTelefone = () => {
    if (telefoneTemp.ddd && telefoneTemp.numero) {
      setUnidadeForm(prev => ({
        ...prev,
        telefones: [...(prev.telefones || []), telefoneTemp]
      }));
      setTelefoneTemp({
        tipo: TipoTelefone.FIXO,
        ddd: 11,
        numero: 0
      });
    }
  };

  const adicionarTelefoneCliente = () => {
    if (telefoneClienteTemp.ddd && telefoneClienteTemp.numero) {
      setClienteForm(prev => ({
        ...prev,
        telefones: [...(prev.telefones || []), telefoneClienteTemp]
      }));
      setTelefoneClienteTemp({ tipo: TipoTelefone.CELULAR, ddd: 11, numero: 0 });
    }
  };

  const removerTelefone = (index: number) => {
    setUnidadeForm(prev => ({
      ...prev,
      telefones: prev.telefones?.filter((_, i) => i !== index) || []
    }));
  };

  const removerTelefoneCliente = (index: number) => {
    setClienteForm(prev => ({
      ...prev,
      telefones: prev.telefones?.filter((_, i) => i !== index) || []
    }));
  };

  // Funções para manipular usuários
  const handleSalvarUsuario = async () => {
    const validationErrors = validarUsuarioForm(usuarioForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingUsuario) {
        const updateData: UsuarioUpdateDTO = {
          nomeUsuario: usuarioForm.nomeUsuario,
          email: usuarioForm.email,
          categoria: usuarioForm.categoria,
          unidadesIds: usuarioForm.unidadesIds
        };
        await usuarioService.atualizarParcialmente(editingUsuario.id, updateData);
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso"
        });
      } else {
        await usuarioService.criar(usuarioForm);
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso"
        });
      }

      setUsuarioModalOpen(false);
      resetUsuarioForm();
      carregarDados();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar usuário",
        variant: "destructive"
      });
    }
  };

  const handleEditarUsuario = (usuario: UsuarioResponseDTO) => {
    setEditingUsuario(usuario);
    setUsuarioForm({
      nomeUsuario: usuario.nomeUsuario,
      email: usuario.email,
      senha: '', // Não preenchemos a senha na edição
      categoria: usuario.categoria,
      unidadesIds: usuario.unidadesIds || []
    });
    setUsuarioModalOpen(true);
  };

  const handleExcluirUsuario = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usuarioService.desativar(id);
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso"
        });
        carregarDados();
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir usuário",
          variant: "destructive"
        });
      }
    }
  };

  const handlePromoverUsuario = async (id: string) => {
    if (confirm('Tem certeza que deseja promover este usuário para administrador?')) {
      try {
        await usuarioService.promoverParaAdministrador(id);
        toast({
          title: "Sucesso",
          description: "Usuário promovido com sucesso"
        });
        carregarDados();
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao promover usuário",
          variant: "destructive"
        });
      }
    }
  };

  const resetUsuarioForm = () => {
    setUsuarioForm({
      nomeUsuario: '',
      email: '',
      senha: '',
      categoria: CategoriaUsuario.USUARIO,
      unidadesIds: []
    });
    setEditingUsuario(null);
    setErrors({});
  };

  const resetClienteForm = () => {
    setClienteForm({
      cpf: '',
      nome: '',
      email: '',
      telefones: [],
      endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: undefined }
    });
    setEditingCliente(null);
    setErrors({});
  };

  // Funções para manipular clientes
  const handleSalvarCliente = async () => {
    const validationErrors = validarClienteForm(clienteForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      if (editingCliente) {
        const updateData: ClienteUpdateDTO = {
          cpf: clienteForm.cpf,
          nome: clienteForm.nome,
          email: clienteForm.email,
          telefones: clienteForm.telefones,
          endereco: clienteForm.endereco
        };
        await clienteService.atualizarParcialmente(editingCliente.id, updateData);
        toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso' });
      } else {
        await clienteService.criar(clienteForm);
        toast({ title: 'Sucesso', description: 'Cliente criado com sucesso' });
      }
      setClienteModalOpen(false);
      resetClienteForm();
      carregarDados();
    } catch (err) {
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
      } catch (err) {
        toast({ title: 'Erro', description: 'Erro ao excluir cliente', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão do Sistema</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      ) : (
        <Tabs defaultValue="filas" className="space-y-4">
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
                    <CardDescription>
                      Gerencie as filas de atendimento do sistema
                    </CardDescription>
                  </div>
                  <Dialog open={filaModalOpen} onOpenChange={setFilaModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetFilaForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Fila
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingFila ? 'Editar Fila' : 'Nova Fila'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingFila ? 'Edite os dados da fila' : 'Preencha os dados da nova fila'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="fila-nome">Nome da Fila *</Label>
                          <Input
                            id="fila-nome"
                            value={filaForm.nome}
                            onChange={(e) => setFilaForm(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Digite o nome da fila"
                            className={errors.nome ? 'border-red-500' : ''}
                          />
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="fila-setor">Setor *</Label>
                          <Select
                            value={filaForm.setorId}
                            onValueChange={(value) => setFilaForm(prev => ({ ...prev, setorId: value }))}
                          >
                            <SelectTrigger className={errors.setorId ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                            <SelectContent>
                              {setores.map((setor) => (
                                <SelectItem key={setor.id} value={setor.id}>
                                  {setor.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.setorId && <p className="text-sm text-red-500">{errors.setorId}</p>}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="fila-unidade">Unidade de Atendimento *</Label>
                          <Select
                            value={filaForm.unidadeAtendimentoId}
                            onValueChange={(value) => setFilaForm(prev => ({ ...prev, unidadeAtendimentoId: value }))}
                          >
                            <SelectTrigger className={errors.unidadeAtendimentoId ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Selecione uma unidade" />
                            </SelectTrigger>
                            <SelectContent>
                              {unidades.map((unidade) => (
                                <SelectItem key={unidade.id} value={unidade.id}>
                                  {unidade.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.unidadeAtendimentoId && <p className="text-sm text-red-500">{errors.unidadeAtendimentoId}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setFilaModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSalvarFila}>
                          {editingFila ? 'Atualizar' : 'Criar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Controles de busca/paginação */}
                <div className="flex items-center gap-2 mb-4">
                  <Select value={filasUnidadeId} onValueChange={(v)=> { setFilasUnidadeId(v); setFilasPage(0); loadFilasPage(0, filasSize, v); }}>
                    <SelectTrigger className="min-w-[220px]"><SelectValue placeholder="Selecione uma unidade"/></SelectTrigger>
                    <SelectContent>
                      {unidadeOptions.map(u=> <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={String(filasSize)} onValueChange={(v)=> { const s=Number(v); setFilasSize(s); setFilasPage(0); loadFilasPage(0, s); }}>
                    <SelectTrigger className="w-[110px]"><SelectValue placeholder="Tamanho"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={()=> loadFilasPage()}>Buscar</Button>
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div>Página { (filasMeta?.page ?? filasPage) + 1 } de { filasMeta?.totalPages ?? 1 }</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(filasMeta?.page ?? filasPage)-1); setFilasPage(p); loadFilasPage(p);}} disabled={(filasMeta?.page ?? filasPage) <= 0}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={()=> {const p=(filasMeta?.page ?? filasPage)+1; if (filasMeta && p>=filasMeta.totalPages) return; setFilasPage(p); loadFilasPage(p);}} disabled={!!filasMeta && (filasMeta.page+1)>=filasMeta.totalPages}>Próxima</Button>
                  </div>
                </div>

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
                    {filas.map((fila) => (
                      <TableRow key={fila.id}>
                        <TableCell>{fila.nome}</TableCell>
                        <TableCell>{fila.setor.nome}</TableCell>
                        <TableCell>{fila.unidade.nome}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarFila(fila)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExcluirFila(fila.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                    <CardDescription>
                      Gerencie os setores de atendimento
                    </CardDescription>
                  </div>
                  <Dialog open={setorModalOpen} onOpenChange={setSetorModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetSetorForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Setor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSetor ? 'Editar Setor' : 'Novo Setor'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingSetor ? 'Edite os dados do setor' : 'Preencha os dados do novo setor'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="setor-nome">Nome do Setor *</Label>
                          <Input
                            id="setor-nome"
                            value={setorForm.nome}
                            onChange={(e) => setSetorForm(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Digite o nome do setor"
                            className={errors.nome ? 'border-red-500' : ''}
                          />
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSetorModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSalvarSetor}>
                          {editingSetor ? 'Atualizar' : 'Criar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Controles de busca/paginação */}
                <div className="flex items-center gap-2 mb-4">
                  <Select value={setoresSearchType} onValueChange={(v: any)=> setSetoresSearchType(v)}>
                    <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="nome">Nome contém</SelectItem>
                    </SelectContent>
                  </Select>
                  {setoresSearchType==='nome' && (
                    <Input className="w-[220px]" placeholder="Buscar por nome" value={setoresSearchValue} onChange={(e)=> setSetoresSearchValue(e.target.value)}/>
                  )}
                  <Select value={String(setoresSize)} onValueChange={(v)=> {const s=Number(v); setSetoresSize(s); setSetoresPage(0); loadSetoresPage(0,s);}}>
                    <SelectTrigger className="w-[110px]"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                  </Select>
                  <Button variant="outline" onClick={()=> loadSetoresPage(0, setoresSize)}>Buscar</Button>
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div>Página { (setoresMeta?.page ?? setoresPage) + 1 } de { setoresMeta?.totalPages ?? 1 }</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(setoresMeta?.page ?? setoresPage)-1); setSetoresPage(p); loadSetoresPage(p);}} disabled={(setoresMeta?.page ?? setoresPage) <= 0}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={()=> {const p=(setoresMeta?.page ?? setoresPage)+1; if (setoresMeta && p>=setoresMeta.totalPages) return; setSetoresPage(p); loadSetoresPage(p);}} disabled={!!setoresMeta && (setoresMeta.page+1)>=setoresMeta.totalPages}>Próxima</Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {setores.map((setor) => (
                      <TableRow key={setor.id}>
                        <TableCell>{setor.nome}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarSetor(setor)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExcluirSetor(setor.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                    <CardDescription>
                      Gerencie as unidades de atendimento
                    </CardDescription>
                  </div>
                  <Dialog open={unidadeModalOpen} onOpenChange={setUnidadeModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetUnidadeForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Unidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingUnidade ? 'Edite os dados da unidade' : 'Preencha os dados da nova unidade'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="unidade-nome">Nome da Unidade *</Label>
                          <Input
                            id="unidade-nome"
                            value={unidadeForm.nome}
                            onChange={(e) => setUnidadeForm(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Digite o nome da unidade"
                            className={errors.nome ? 'border-red-500' : ''}
                          />
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>

                        {/* Seção de Endereço */}
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Endereço
                          </h4>

                          <div className="grid gap-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input
                              id="cep"
                              value={unidadeForm.endereco?.cep || ''}
                              onChange={(e) => setUnidadeForm(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco!, cep: e.target.value }
                              }))}
                              placeholder="00000-000"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="logradouro">Logradouro</Label>
                              <Input
                                id="logradouro"
                                value={unidadeForm.endereco?.logradouro || ''}
                                onChange={(e) => setUnidadeForm(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco!, logradouro: e.target.value }
                                }))}
                                placeholder="Rua, Avenida, etc."
                                className={errors.logradouro ? 'border-red-500' : ''}
                              />
                              {errors.logradouro && <p className="text-sm text-red-500">{errors.logradouro}</p>}
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="numero">Número</Label>
                              <Input
                                id="numero"
                                value={unidadeForm.endereco?.numero || ''}
                                onChange={(e) => setUnidadeForm(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco!, numero: e.target.value }
                                }))}
                                placeholder="123"
                                className={errors.numero ? 'border-red-500' : ''}
                              />
                              {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                              id="complemento"
                              value={unidadeForm.endereco?.complemento || ''}
                              onChange={(e) => setUnidadeForm(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco!, complemento: e.target.value }
                              }))}
                              placeholder="Apartamento, sala, etc."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="bairro">Bairro</Label>
                              <Input
                                id="bairro"
                                value={unidadeForm.endereco?.bairro || ''}
                                onChange={(e) => setUnidadeForm(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco!, bairro: e.target.value }
                                }))}
                                placeholder="Nome do bairro"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="cidade">Cidade</Label>
                              <Input
                                id="cidade"
                                value={unidadeForm.endereco?.cidade || ''}
                                onChange={(e) => setUnidadeForm(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco!, cidade: e.target.value }
                                }))}
                                placeholder="Nome da cidade"
                              />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="uf">UF</Label>
                            <Select
                              value={unidadeForm.endereco?.uf || ''}
                              onValueChange={(value) => setUnidadeForm(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco!, uf: value as UF }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(UF).map((uf) => (
                                  <SelectItem key={uf} value={uf}>
                                    {uf}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Seção de Telefones */}
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Telefones
                          </h4>

                          <div className="grid grid-cols-4 gap-2">
                            <Select
                              value={telefoneTemp.tipo}
                              onValueChange={(value) => setTelefoneTemp(prev => ({ ...prev, tipo: value as TipoTelefone }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={TipoTelefone.FIXO}>Fixo</SelectItem>
                                <SelectItem value={TipoTelefone.CELULAR}>Celular</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              type="number"
                              value={telefoneTemp.ddd || ''}
                              onChange={(e) => setTelefoneTemp(prev => ({ ...prev, ddd: parseInt(e.target.value) || 0 }))
                              }
                              placeholder="DDD"
                            />

                            <Input
                              type="number"
                              value={telefoneTemp.numero || ''}
                              onChange={(e) => setTelefoneTemp(prev => ({ ...prev, numero: parseInt(e.target.value) || 0 }))
                              }
                              placeholder="Número"
                            />

                            <Button type="button" onClick={adicionarTelefone}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {unidadeForm.telefones && unidadeForm.telefones.length > 0 && (
                            <div className="space-y-2">
                              {unidadeForm.telefones.map((telefone, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <span>
                                    {telefone.tipo} - ({telefone.ddd}) {telefone.numero}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removerTelefone(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUnidadeModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSalvarUnidade}>
                          {editingUnidade ? 'Atualizar' : 'Criar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Controles de busca/paginação */}
                <div className="flex items-center gap-2 mb-4">
                  <Select value={unidadesSearchType} onValueChange={(v: any)=> setUnidadesSearchType(v)}>
                    <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="nome">Nome contém</SelectItem>
                    </SelectContent>
                  </Select>
                  {unidadesSearchType==='nome' && (
                    <Input className="w-[220px]" placeholder="Buscar por nome" value={unidadesSearchValue} onChange={(e)=> setUnidadesSearchValue(e.target.value)}/>
                  )}
                  <Select value={String(unidadesSize)} onValueChange={(v)=> {const s=Number(v); setUnidadesSize(s); setUnidadesPage(0); loadUnidadesPage(0,s);}}>
                    <SelectTrigger className="w-[110px]"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                  </Select>
                  <Button variant="outline" onClick={()=> loadUnidadesPage(0, unidadesSize)}>Buscar</Button>
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div>Página { (unidadesMeta?.page ?? unidadesPage) + 1 } de { unidadesMeta?.totalPages ?? 1 }</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(unidadesMeta?.page ?? unidadesPage)-1); setUnidadesPage(p); loadUnidadesPage(p);}} disabled={(unidadesMeta?.page ?? unidadesPage) <= 0}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={()=> {const p=(unidadesMeta?.page ?? unidadesPage)+1; if (unidadesMeta && p>=unidadesMeta.totalPages) return; setUnidadesPage(p); loadUnidadesPage(p);}} disabled={!!unidadesMeta && (unidadesMeta.page+1)>=unidadesMeta.totalPages}>Próxima</Button>
                  </div>
                </div>
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
                    {unidades.map((unidade) => (
                      <TableRow key={unidade.id}>
                        <TableCell>{unidade.nome}</TableCell>
                        <TableCell>
                          {unidade.endereco?.enderecoFormatado ||
                           `${unidade.endereco?.logradouro}, ${unidade.endereco?.numero}` ||
                           'Não informado'}
                        </TableCell>
                        <TableCell>
                          {unidade.telefones?.map((tel, idx) => (
                            <div key={idx} className="text-sm">
                              {tel.tipo}: ({tel.ddd}) {tel.numero}
                            </div>
                          )) || 'Nenhum'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarUnidade(unidade)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExcluirUnidade(unidade.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                    <CardDescription>
                      Gerencie os usuários do sistema
                    </CardDescription>
                  </div>
                  <Dialog open={usuarioModalOpen} onOpenChange={setUsuarioModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetUsuarioForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingUsuario ? 'Edite os dados do usuário' : 'Preencha os dados do novo usuário'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="usuario-nome">Nome de Usuário *</Label>
                          <Input
                            id="usuario-nome"
                            value={usuarioForm.nomeUsuario}
                            onChange={(e) => setUsuarioForm(prev => ({ ...prev, nomeUsuario: e.target.value }))}
                            placeholder="Digite o nome de usuário"
                            className={errors.nomeUsuario ? 'border-red-500' : ''}
                          />
                          {errors.nomeUsuario && <p className="text-sm text-red-500">{errors.nomeUsuario}</p>}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="usuario-email">Email *</Label>
                          <Input
                            id="usuario-email"
                            type="email"
                            value={usuarioForm.email}
                            onChange={(e) => setUsuarioForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="usuario@email.com"
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        {!editingUsuario && (
                          <div className="grid gap-2">
                            <Label htmlFor="usuario-senha">Senha *</Label>
                            <Input
                              id="usuario-senha"
                              type="password"
                              value={usuarioForm.senha}
                              onChange={(e) => setUsuarioForm(prev => ({ ...prev, senha: e.target.value }))}
                              placeholder="Digite a senha"
                              className={errors.senha ? 'border-red-500' : ''}
                            />
                            {errors.senha && <p className="text-sm text-red-500">{errors.senha}</p>}
                          </div>
                        )}

                        <div className="grid gap-2">
                          <Label htmlFor="usuario-categoria">Categoria *</Label>
                          <Select
                            value={usuarioForm.categoria}
                            onValueChange={(value) => setUsuarioForm(prev => ({ ...prev, categoria: value as CategoriaUsuario }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={CategoriaUsuario.USUARIO}>Usuário</SelectItem>
                              <SelectItem value={CategoriaUsuario.ADMINISTRADOR}>Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Unidades de Acesso</Label>
                          <div className="space-y-2">
                            {unidades.map((unidade) => (
                              <div key={unidade.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`unidade-${unidade.id}`}
                                  checked={usuarioForm.unidadesIds?.includes(unidade.id) || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setUsuarioForm(prev => ({
                                        ...prev,
                                        unidadesIds: [...(prev.unidadesIds || []), unidade.id]
                                      }));
                                    } else {
                                      setUsuarioForm(prev => ({
                                        ...prev,
                                        unidadesIds: prev.unidadesIds?.filter(id => id !== unidade.id) || []
                                      }));
                                    }
                                  }}
                                />
                                <Label htmlFor={`unidade-${unidade.id}`}>{unidade.nome}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUsuarioModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSalvarUsuario}>
                          {editingUsuario ? 'Atualizar' : 'Criar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Controles de busca/paginação */}
                <div className="flex items-center gap-2 mb-4">
                  <Select value={usuariosSearchType} onValueChange={(v: any)=> setUsuariosSearchType(v)}>
                    <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="email">Email exato</SelectItem>
                    </SelectContent>
                  </Select>
                  {usuariosSearchType==='email' && (
                    <Input className="w-[220px]" placeholder="usuario@email.com" value={usuariosSearchValue} onChange={(e)=> setUsuariosSearchValue(e.target.value)}/>
                  )}
                  <Select value={String(usuariosSize)} onValueChange={(v)=> {const s=Number(v); setUsuariosSize(s); setUsuariosPage(0); loadUsuariosPage(0,s);}}>
                    <SelectTrigger className="w-[110px]"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                  </Select>
                  <Button variant="outline" onClick={()=> loadUsuariosPage(0, usuariosSize)}>Buscar</Button>
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div>Página { (usuariosMeta?.page ?? usuariosPage) + 1 } de { usuariosMeta?.totalPages ?? 1 }</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(usuariosMeta?.page ?? usuariosPage)-1); setUsuariosPage(p); loadUsuariosPage(p);}} disabled={(usuariosMeta?.page ?? usuariosPage) <= 0}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={()=> {const p=(usuariosMeta?.page ?? usuariosPage)+1; if (usuariosMeta && p>=usuariosMeta.totalPages) return; setUsuariosPage(p); loadUsuariosPage(p);}} disabled={!!usuariosMeta && (usuariosMeta.page+1)>=usuariosMeta.totalPages}>Próxima</Button>
                  </div>
                </div>
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
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>{usuario.nomeUsuario}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.categoria === CategoriaUsuario.ADMINISTRADOR ? 'default' : 'secondary'}>
                            {usuario.categoria === CategoriaUsuario.ADMINISTRADOR ? (
                              <><ShieldCheck className="w-3 h-3 mr-1" />Admin</>
                            ) : (
                              <><Shield className="w-3 h-3 mr-1" />Usuário</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {usuario.unidadesIds?.length || 0} unidade(s)
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarUsuario(usuario)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {usuario.categoria !== CategoriaUsuario.ADMINISTRADOR && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePromoverUsuario(usuario.id)}
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExcluirUsuario(usuario.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                      <Button onClick={resetClienteForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                        <DialogDescription>
                          {editingCliente ? 'Edite os dados do cliente' : 'Preencha os dados do novo cliente'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-cpf">CPF *</Label>
                          <Input id="cliente-cpf" value={clienteForm.cpf}
                            onChange={(e)=> setClienteForm(prev=>({...prev, cpf: e.target.value}))}
                            placeholder="000.000.000-00" className={errors.cpf ? 'border-red-500' : ''}/>
                          {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-nome">Nome *</Label>
                          <Input id="cliente-nome" value={clienteForm.nome}
                            onChange={(e)=> setClienteForm(prev=>({...prev, nome: e.target.value}))}
                            placeholder="Nome completo" className={errors.nome ? 'border-red-500' : ''}/>
                          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cliente-email">Email</Label>
                          <Input id="cliente-email" type="email" value={clienteForm.email || ''}
                            onChange={(e)=> setClienteForm(prev=>({...prev, email: e.target.value}))}
                            placeholder="cliente@email.com" className={errors.email ? 'border-red-500' : ''}/>
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        {/* Endereço do Cliente */}
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />Endereço</h4>
                          <div className="grid gap-2">
                            <Label htmlFor="cliente-cep">CEP</Label>
                            <Input id="cliente-cep" value={clienteForm.endereco?.cep || ''}
                              onChange={(e)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, cep: e.target.value}}))}
                              placeholder="00000-000"/>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="cliente-logradouro">Logradouro</Label>
                              <Input id="cliente-logradouro" value={clienteForm.endereco?.logradouro || ''}
                                onChange={(e)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, logradouro: e.target.value}}))}
                                placeholder="Rua, Avenida, etc." className={errors.logradouro ? 'border-red-500' : ''}/>
                              {errors.logradouro && <p className="text-sm text-red-500">{errors.logradouro}</p>}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="cliente-numero">Número</Label>
                              <Input id="cliente-numero" value={clienteForm.endereco?.numero || ''}
                                onChange={(e)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, numero: e.target.value}}))}
                                placeholder="123" className={errors.numero ? 'border-red-500' : ''}/>
                              {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cliente-complemento">Complemento</Label>
                            <Input id="cliente-complemento" value={clienteForm.endereco?.complemento || ''}
                              onChange={(e)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, complemento: e.target.value}}))}
                              placeholder="Apartamento, sala, etc."/>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="cliente-bairro">Bairro</Label>
                              <Input id="cliente-bairro" value={clienteForm.endereco?.bairro || ''}
                                onChange={(e)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, bairro: e.target.value}}))}
                                placeholder="Bairro"/>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="cliente-cidade">Cidade</Label>
                              <Input id="cliente-cidade" value={clienteForm.endereco?.cidade || ''}
                                onChange={(e)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, cidade: e.target.value}}))}
                                placeholder="Cidade"/>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cliente-uf">UF</Label>
                            <Select value={clienteForm.endereco?.uf || ''}
                              onValueChange={(value)=> setClienteForm(prev=>({...prev, endereco:{...prev.endereco!, uf: value as UF}}))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(UF).map(uf=> (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Telefones do Cliente */}
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2"><Phone className="w-4 h-4" />Telefones</h4>
                          <div className="grid grid-cols-4 gap-2">
                            <Select value={telefoneClienteTemp.tipo}
                              onValueChange={(value)=> setTelefoneClienteTemp(prev=>({...prev, tipo: value as TipoTelefone}))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value={TipoTelefone.FIXO}>Fixo</SelectItem>
                                <SelectItem value={TipoTelefone.CELULAR}>Celular</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input type="number" value={telefoneClienteTemp.ddd || ''} placeholder="DDD"
                              onChange={(e)=> setTelefoneClienteTemp(prev=>({...prev, ddd: parseInt(e.target.value)||0}))}/>
                            <Input type="number" value={telefoneClienteTemp.numero || ''} placeholder="Número"
                              onChange={(e)=> setTelefoneClienteTemp(prev=>({...prev, numero: parseInt(e.target.value)||0}))}/>
                            <Button type="button" onClick={adicionarTelefoneCliente}><Plus className="w-4 h-4" /></Button>
                          </div>
                          {clienteForm.telefones && clienteForm.telefones.length > 0 && (
                            <div className="space-y-2">
                              {clienteForm.telefones.map((tel, idx)=> (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                  <span>{tel.tipo} - ({tel.ddd}) {tel.numero}</span>
                                  <Button type="button" variant="outline" size="sm" onClick={()=> removerTelefoneCliente(idx)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
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
                {/* Controles de busca/paginação */}
                <div className="flex items-center gap-2 mb-4">
                  <Select value={clientesSearchType} onValueChange={(v: any)=> setClientesSearchType(v)}>
                    <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="nome">Nome contém</SelectItem>
                      <SelectItem value="cpf">CPF exato</SelectItem>
                    </SelectContent>
                  </Select>
                  {clientesSearchType!=='todos' && (
                    <Input className="w-[220px]" placeholder={clientesSearchType==='nome' ? 'Nome' : 'CPF'} value={clientesSearchValue} onChange={(e)=> setClientesSearchValue(e.target.value)}/>
                  )}
                  <Select value={String(clientesSize)} onValueChange={(v)=> {const s=Number(v); setClientesSize(s); setClientesPage(0); loadClientesPage(0,s);}}>
                    <SelectTrigger className="w-[110px]"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                  </Select>
                  <Button variant="outline" onClick={()=> loadClientesPage(0, clientesSize)}>Buscar</Button>
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div>Página { (clientesMeta?.page ?? clientesPage) + 1 } de { clientesMeta?.totalPages ?? 1 }</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=> {const p=Math.max(0,(clientesMeta?.page ?? clientesPage)-1); setClientesPage(p); loadClientesPage(p);}} disabled={(clientesMeta?.page ?? clientesPage) <= 0}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={()=> {const p=(clientesMeta?.page ?? clientesPage)+1; if (clientesMeta && p>=clientesMeta.totalPages) return; setClientesPage(p); loadClientesPage(p);}} disabled={!!clientesMeta && (clientesMeta.page+1)>=clientesMeta.totalPages}>Próxima</Button>
                  </div>
                </div>
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
                    {clientes.map((cliente)=> (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell>{cliente.cpf}</TableCell>
                        <TableCell>{cliente.email || '-'}</TableCell>
                        <TableCell>
                          {cliente.telefones && cliente.telefones.length>0 ? (
                            <div className="space-y-1">
                              {cliente.telefones.map((t, i)=> (
                                <div key={i} className="text-sm">{t.tipo}: ({t.ddd}) {t.numero}</div>
                              ))}
                            </div>
                          ) : 'Nenhum'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={()=> handleEditarCliente(cliente)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={()=> handleExcluirCliente(cliente.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
};

export default Gestao;
