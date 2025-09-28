import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Search, Pencil, Trash2, Save, X, Plus } from 'lucide-react';
import { unidadeService } from '@/services/unidadeService';
import { setorService } from '@/services/setorService';
import { filaService } from '@/services/filaService';
import { usuarioService } from '@/services/usuarioService';
import { clienteService } from '@/services/clienteService';
import type {
  UnidadeAtendimentoResponseDTO,
  SetorResponseDTO,
  FilaResponseDTO,
  UsuarioResponseDTO,
  ClienteResponseDTO,
  UsuarioUpdateDTO,
  UnidadeAtendimentoUpdateDTO,
  FilaUpdateDTO,
  ClienteUpdateDTO,
  FilaCreateDTO,
  SetorCreateDTO,
  UnidadeAtendimentoCreateDTO,
  UsuarioCreateDTO,
  ClienteCreateDTO,
  Telefone,
  Endereco,
} from '@/types';

// UFs do Brasil
const BRAZIL_UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
] as const;

// Aba na ordem solicitada
const TABS = ['filas', 'unidades', 'setores', 'clientes', 'usuarios'] as const;
type TabKey = typeof TABS[number];

type SearchState = {
  field: string;
  query: string;
};

const Gestao = () => {
  // Carregamento e refresh
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dados
  const [unidades, setUnidades] = useState<UnidadeAtendimentoResponseDTO[]>([]);
  const [setores, setSetores] = useState<SetorResponseDTO[]>([]);
  const [filas, setFilas] = useState<FilaResponseDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);

  // Navegação e busca
  const [activeTab, setActiveTab] = useState<TabKey>('filas');
  const [search, setSearch] = useState<Record<TabKey, SearchState>>({
    filas: { field: 'nome', query: '' },
    unidades: { field: 'nome', query: '' },
    setores: { field: 'nome', query: '' },
    clientes: { field: 'nome', query: '' },
    usuarios: { field: 'nomeUsuario', query: '' },
  });

  // Edição (modais)
  const [editUsuarioId, setEditUsuarioId] = useState<string | null>(null);
  const [draftUsuario, setDraftUsuario] = useState<Partial<UsuarioUpdateDTO>>({});

  const [editUnidadeId, setEditUnidadeId] = useState<string | null>(null);
  const [draftUnidade, setDraftUnidade] = useState<Partial<UnidadeAtendimentoUpdateDTO>>({});

  const [editSetorId, setEditSetorId] = useState<string | null>(null);
  const [draftSetor, setDraftSetor] = useState<{ nome?: string }>({});

  const [editClienteId, setEditClienteId] = useState<string | null>(null);
  const [draftCliente, setDraftCliente] = useState<Partial<ClienteUpdateDTO>>({});

  const [editFilaId, setEditFilaId] = useState<string | null>(null);
  const [draftFila, setDraftFila] = useState<Partial<FilaUpdateDTO>>({});

  // Criação (modais)
  const [openCreateFila, setOpenCreateFila] = useState(false);
  const [createFila, setCreateFila] = useState<Partial<FilaCreateDTO>>({ nome: '', setorId: '', unidadeAtendimentoId: '' });

  const [openCreateUnidade, setOpenCreateUnidade] = useState(false);
  const [createUnidade, setCreateUnidade] = useState<Partial<UnidadeAtendimentoCreateDTO>>({ nome: '' });

  const [openCreateSetor, setOpenCreateSetor] = useState(false);
  const [createSetor, setCreateSetor] = useState<Partial<SetorCreateDTO>>({ nome: '' });

  const [openCreateCliente, setOpenCreateCliente] = useState(false);
  const [createCliente, setCreateCliente] = useState<Partial<ClienteCreateDTO>>({ cpf: '', nome: '', email: '' });

  const [openCreateUsuario, setOpenCreateUsuario] = useState(false);
  const [createUsuario, setCreateUsuario] = useState<Partial<UsuarioCreateDTO>>({ nomeUsuario: '', email: '', senha: '', categoria: 'USUARIO' });

  const { toast } = useToast();

  // Helpers nomes
  const getSetorNome = (id?: string) => setores.find((s) => (s as any).id === id)?.nome || id || '';
  const getUnidadeNome = (id?: string) => unidades.find((u) => (u as any).id === id)?.nome || id || '';

  const formatTelefones = (telefones?: Telefone[]) =>
    (telefones || [])
      .map((t) => `${t.ddd}-${t.numero} (${t.tipo})`)
      .join(', ');

  const formatEndereco = (end?: Endereco) => {
    if (!end) return '';
    const parts = [end.logradouro, end.numero, end.complemento, end.bairro, end.cidade, end.uf, end.cep].filter(Boolean);
    return parts.join(', ');
  };

  // Carregar dados
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async (soft = false) => {
    try {
      soft ? setRefreshing(true) : setLoading(true);

      // Buscar principais em paralelo
      const [unidadesData, setoresData, usuariosData, clientesData] = await Promise.all([
        unidadeService.listarTodas(),
        setorService.listarTodos(),
        usuarioService.listarTodos(),
        clienteService.listarTodos(),
      ]);

      setUnidades(unidadesData);
      setSetores(setoresData);
      setUsuarios(usuariosData);
      setClientes(clientesData);

      // Filas: não há listarTodos; agregamos por unidade
      const filasArrays = await Promise.all(
        (unidadesData || []).map((u) =>
          filaService
            .listarPorUnidade((u as any).id)
            .catch(() => [] as FilaResponseDTO[])
        )
      );
      setFilas(filasArrays.flat());

      if (soft) toast({ title: 'Atualizado', description: 'Dados de gestão atualizados.' });
    } catch (error: any) {
      console.error('Erro ao carregar gestão:', error);
      toast({ title: 'Erro ao carregar dados', description: error?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => loadAll(true);

  // Campos de busca por aba
  const searchFields: Record<TabKey, { value: string; label: string }[]> = {
    filas: [
      { value: 'nome', label: 'Nome' },
      { value: 'setorId', label: 'Setor' },
      { value: 'unidadeAtendimentoId', label: 'Unidade' },
    ],
    unidades: [{ value: 'nome', label: 'Nome' }],
    setores: [{ value: 'nome', label: 'Nome' }],
    clientes: [
      { value: 'nome', label: 'Nome' },
      { value: 'cpf', label: 'CPF' },
      { value: 'email', label: 'Email' },
    ],
    usuarios: [
      { value: 'nomeUsuario', label: 'Nome de Usuário' },
      { value: 'email', label: 'Email' },
      { value: 'categoria', label: 'Categoria' },
    ],
  };

  // Utilitário simples de filtro client-side
  const filterList = <T extends Record<string, any>>(list: T[], field: string, term: string) => {
    if (!term) return list;
    const t = term.toLowerCase();
    return list.filter((item) => String(item?.[field] ?? '').toLowerCase().includes(t));
  };

  // Listas filtradas
  const filtered = {
    filas: useMemo(() => filterList(filas, search.filas.field, search.filas.query), [filas, search.filas]),
    unidades: useMemo(() => filterList(unidades, search.unidades.field, search.unidades.query), [unidades, search.unidades]),
    setores: useMemo(() => filterList(setores, search.setores.field, search.setores.query), [setores, search.setores]),
    clientes: useMemo(() => filterList(clientes, search.clientes.field, search.clientes.query), [clientes, search.clientes]),
    usuarios: useMemo(() => filterList(usuarios, search.usuarios.field, search.usuarios.query), [usuarios, search.usuarios]),
  } as const;

  // Helpers de endereço: só envia se houver conteúdo relevante
  const normalizeEndereco = (e?: Partial<Endereco>): Endereco | undefined => {
    if (!e) return undefined;
    const anyFilled = Object.values(e).some((v) => v !== undefined && v !== '');
    if (!anyFilled) return undefined;
    return e as Endereco; // backend aceita parcial no PATCH
  };

  // ====== Salvar (Edit) ======
  const saveUsuario = async () => {
    if (!editUsuarioId) return;
    try {
      const updated = await usuarioService.atualizarParcialmente(editUsuarioId, draftUsuario as UsuarioUpdateDTO);
      setUsuarios((prev) => prev.map((u) => (u.id === editUsuarioId ? { ...u, ...updated } : u)));
      toast({ title: 'Usuário atualizado' });
      setEditUsuarioId(null);
      setDraftUsuario({});
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar usuário', description: e?.message || '', variant: 'destructive' });
    }
  };

  const saveUnidade = async () => {
    if (!editUnidadeId) return;
    try {
      const payload: UnidadeAtendimentoUpdateDTO = { nome: draftUnidade.nome || '' };
      const updated = await unidadeService.atualizarParcialmente(editUnidadeId, payload);
      setUnidades((prev) => prev.map((u) => (u.id === editUnidadeId ? { ...u, ...updated } : u)));
      toast({ title: 'Unidade atualizada' });
      setEditUnidadeId(null);
      setDraftUnidade({});
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar unidade', description: e?.message || '', variant: 'destructive' });
    }
  };

  const saveSetor = async () => {
    if (!editSetorId) return;
    try {
      const payload = { nome: draftSetor.nome || '' } as any;
      const updated = await setorService.atualizarParcialmente(editSetorId, payload);
      setSetores((prev) => prev.map((s) => (s.id === editSetorId ? { ...s, ...updated } : s)));
      toast({ title: 'Setor atualizado' });
      setEditSetorId(null);
      setDraftSetor({});
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar setor', description: e?.message || '', variant: 'destructive' });
    }
  };

  const saveCliente = async () => {
    if (!editClienteId) return;
    try {
      const payload: ClienteUpdateDTO = {
        cpf: draftCliente.cpf,
        nome: draftCliente.nome,
        email: draftCliente.email,
        telefones: draftCliente.telefones as Telefone[] | undefined,
        endereco: normalizeEndereco(draftCliente.endereco as Partial<Endereco>),
      };
      const updated = await clienteService.atualizarParcialmente(editClienteId, payload);
      setClientes((prev) => prev.map((c) => (c.id === editClienteId ? { ...c, ...updated } : c)));
      toast({ title: 'Cliente atualizado' });
      setEditClienteId(null);
      setDraftCliente({});
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar cliente', description: e?.message || '', variant: 'destructive' });
    }
  };

  const saveFila = async () => {
    if (!editFilaId) return;
    try {
      const current = filas.find((f) => f.id === editFilaId) as any;
      const payload: FilaUpdateDTO = {
        nome: draftFila.nome || current?.nome || '',
        setorId: (draftFila as any).setorId || current?.setorId,
        unidadeAtendimentoId: (draftFila as any).unidadeAtendimentoId || current?.unidadeAtendimentoId,
      } as FilaUpdateDTO;
      const updated = await filaService.atualizarParcialmente(editFilaId, payload);
      setFilas((prev) => prev.map((f) => (f.id === editFilaId ? { ...f, ...updated } : f)));
      toast({ title: 'Fila atualizada' });
      setEditFilaId(null);
      setDraftFila({});
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar fila', description: e?.message || '', variant: 'destructive' });
    }
  };

  // ====== Remover ======
  const deleteUsuario = async (id: string) => {
    try {
      await usuarioService.desativar(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      toast({ title: 'Usuário removido' });
    } catch (e: any) {
      toast({ title: 'Erro ao remover usuário', description: e?.message || '', variant: 'destructive' });
    }
  };

  const deleteUnidade = async (id: string) => {
    try {
      await unidadeService.desativar(id);
      setUnidades((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      toast({ title: 'Erro ao remover unidade', description: e?.message || '', variant: 'destructive' });
    }
  };

  const deleteSetor = async (id: string) => {
    try {
      await setorService.desativar(id);
      setSetores((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Setor removido' });
    } catch (e: any) {
      toast({ title: 'Erro ao remover setor', description: e?.message || '', variant: 'destructive' });
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      await clienteService.desativar(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Cliente removido' });
    } catch (e: any) {
      toast({ title: 'Erro ao remover cliente', description: e?.message || '', variant: 'destructive' });
    }
  };

  const deleteFila = async (id: string) => {
    try {
      await filaService.desativar(id);
      setFilas((prev) => prev.filter((f) => f.id !== id));
      toast({ title: 'Fila removida' });
    } catch (e: any) {
      toast({ title: 'Erro ao remover fila', description: e?.message || '', variant: 'destructive' });
    }
  };

  // ====== Criar ======
  const addFila = async () => {
    try {
      const payload: FilaCreateDTO = {
        nome: (createFila.nome || '').trim(),
        setorId: (createFila as any).setorId || '',
        unidadeAtendimentoId: (createFila as any).unidadeAtendimentoId || '',
      };
      if (!payload.nome || !payload.setorId || !payload.unidadeAtendimentoId) {
        toast({ title: 'Preencha nome, setor e unidade', variant: 'destructive' });
        return;
      }
      const created = await filaService.criar(payload);
      setFilas((prev) => [created, ...prev]);
      setOpenCreateFila(false);
      setCreateFila({ nome: '', setorId: '', unidadeAtendimentoId: '' });
      toast({ title: 'Fila criada' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar fila', description: e?.message || '', variant: 'destructive' });
    }
  };

  const addUnidade = async () => {
    try {
      const payload: UnidadeAtendimentoCreateDTO = { nome: (createUnidade.nome || '').trim() } as any;
      if (!payload.nome) {
        toast({ title: 'Informe o nome da unidade', variant: 'destructive' });
        return;
      }
      const created = await unidadeService.criar(payload);
      setUnidades((prev) => [created, ...prev]);
      setOpenCreateUnidade(false);
      setCreateUnidade({ nome: '' });
      toast({ title: 'Unidade criada' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar unidade', description: e?.message || '', variant: 'destructive' });
    }
  };

  const addSetor = async () => {
    try {
      const payload: SetorCreateDTO = { nome: (createSetor.nome || '').trim() };
      if (!payload.nome) {
        toast({ title: 'Informe o nome do setor', variant: 'destructive' });
        return;
      }
      const created = await setorService.criar(payload);
      setSetores((prev) => [created, ...prev]);
      setOpenCreateSetor(false);
      setCreateSetor({ nome: '' });
      toast({ title: 'Setor criado' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar setor', description: e?.message || '', variant: 'destructive' });
    }
  };

  const addCliente = async () => {
    try {
      const endereco = normalizeEndereco(createCliente.endereco as Partial<Endereco>);
      const payload: ClienteCreateDTO = {
        cpf: (createCliente.cpf || '').trim(),
        nome: (createCliente.nome || '').trim(),
        email: (createCliente.email || '').trim(),
        telefones: (createCliente.telefones as Telefone[]) || undefined,
        endereco: endereco as any,
      } as any;
      if (!payload.cpf || !payload.nome) {
        toast({ title: 'Informe ao menos CPF e Nome', variant: 'destructive' });
        return;
      }
      const created = await clienteService.criar(payload);
      setClientes((prev) => [created, ...prev]);
      setOpenCreateCliente(false);
      setCreateCliente({ cpf: '', nome: '', email: '' });
      toast({ title: 'Cliente criado' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar cliente', description: e?.message || '', variant: 'destructive' });
    }
  };

  const addUsuario = async () => {
    try {
      const payload: UsuarioCreateDTO = {
        nomeUsuario: (createUsuario.nomeUsuario || '').trim(),
        email: (createUsuario.email || '').trim(),
        senha: (createUsuario.senha || '').trim(),
        categoria: (createUsuario.categoria as any) || 'USUARIO',
      } as any;
      if (!payload.nomeUsuario || !payload.email || !payload.senha) {
        toast({ title: 'Informe nome, email e senha', variant: 'destructive' });
        return;
      }
      const created = await usuarioService.criar(payload);
      setUsuarios((prev) => [created, ...prev]);
      setOpenCreateUsuario(false);
      setCreateUsuario({ nomeUsuario: '', email: '', senha: '', categoria: 'USUARIO' });
      toast({ title: 'Usuário criado' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar usuário', description: e?.message || '', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="flex items-center gap-2 justify-center text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Carregando gestão...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão</h1>
          <p className="text-muted-foreground">Filas, Unidades, Setores, Clientes e Usuários</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList>
          <TabsTrigger value="filas">Filas</TabsTrigger>
          <TabsTrigger value="unidades">Unidades de Atendimento</TabsTrigger>
          <TabsTrigger value="setores">Setores</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        {/* FILAS */}
        <TabsContent value="filas">
          <Card>
            <CardHeader>
              <CardTitle>Filas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-60">
                  <Select
                    value={search.filas.field}
                    onValueChange={(val) => setSearch((s) => ({ ...s, filas: { ...s.filas, field: val } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchFields.filas.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar..."
                    value={search.filas.query}
                    onChange={(e) => setSearch((s) => ({ ...s, filas: { ...s.filas, query: e.target.value } }))}
                  />
                </div>
                <div className="sm:ml-auto">
                  <Button size="sm" onClick={() => setOpenCreateFila(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.filas.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell><span>{(f as any).nome}</span></TableCell>
                        <TableCell><span>{getSetorNome((f as any).setorId)}</span></TableCell>
                        <TableCell><span>{getUnidadeNome((f as any).unidadeAtendimentoId)}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditFilaId((f as any).id);
                                setDraftFila({ nome: (f as any).nome, setorId: (f as any).setorId, unidadeAtendimentoId: (f as any).unidadeAtendimentoId });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteFila((f as any).id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.filas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhuma fila encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UNIDADES */}
        <TabsContent value="unidades">
          <Card>
            <CardHeader>
              <CardTitle>Unidades de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-60">
                  <Select
                    value={search.unidades.field}
                    onValueChange={(val) => setSearch((s) => ({ ...s, unidades: { ...s.unidades, field: val } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchFields.unidades.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar..."
                    value={search.unidades.query}
                    onChange={(e) => setSearch((s) => ({ ...s, unidades: { ...s.unidades, query: e.target.value } }))}
                  />
                </div>
                <div className="sm:ml-auto">
                  <Button size="sm" onClick={() => setOpenCreateUnidade(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.unidades.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell><span>{(u as any).nome}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditUnidadeId((u as any).id);
                                setDraftUnidade({ nome: (u as any).nome });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteUnidade((u as any).id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.unidades.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Nenhuma unidade encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETORES */}
        <TabsContent value="setores">
          <Card>
            <CardHeader>
              <CardTitle>Setores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-60">
                  <Select
                    value={search.setores.field}
                    onValueChange={(val) => setSearch((s) => ({ ...s, setores: { ...s.setores, field: val } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchFields.setores.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar..."
                    value={search.setores.query}
                    onChange={(e) => setSearch((s) => ({ ...s, setores: { ...s.setores, query: e.target.value } }))}
                  />
                </div>
                <div className="sm:ml-auto">
                  <Button size="sm" onClick={() => setOpenCreateSetor(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.setores.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell><span>{(s as any).nome}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditSetorId((s as any).id);
                                setDraftSetor({ nome: (s as any).nome });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteSetor((s as any).id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.setores.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Nenhum setor encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLIENTES */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-60">
                  <Select
                    value={search.clientes.field}
                    onValueChange={(val) => setSearch((s) => ({ ...s, clientes: { ...s.clientes, field: val } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchFields.clientes.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar..."
                    value={search.clientes.query}
                    onChange={(e) => setSearch((s) => ({ ...s, clientes: { ...s.clientes, query: e.target.value } }))}
                  />
                </div>
                <div className="sm:ml-auto">
                  <Button size="sm" onClick={() => setOpenCreateCliente(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CPF</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefones</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.clientes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell><span>{(c as any).cpf}</span></TableCell>
                        <TableCell><span>{(c as any).nome}</span></TableCell>
                        <TableCell><span>{(c as any).email}</span></TableCell>
                        <TableCell><span>{formatTelefones((c as any).telefones)}</span></TableCell>
                        <TableCell><span>{formatEndereco((c as any).endereco)}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditClienteId((c as any).id);
                                setDraftCliente({ cpf: (c as any).cpf, nome: (c as any).nome, email: (c as any).email, telefones: (c as any).telefones, endereco: (c as any).endereco});
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteCliente((c as any).id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.clientes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USUÁRIOS */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-60">
                  <Select
                    value={search.usuarios.field}
                    onValueChange={(val) => setSearch((s) => ({ ...s, usuarios: { ...s.usuarios, field: val } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchFields.usuarios.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar..."
                    value={search.usuarios.query}
                    onChange={(e) => setSearch((s) => ({ ...s, usuarios: { ...s.usuarios, query: e.target.value } }))}
                  />
                </div>
                <div className="sm:ml-auto">
                  <Button size="sm" onClick={() => setOpenCreateUsuario(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.usuarios.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell><span>{(u as any).nomeUsuario}</span></TableCell>
                        <TableCell><span>{(u as any).email}</span></TableCell>
                        <TableCell><span>{(u as any).categoria}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditUsuarioId((u as any).id);
                                setDraftUsuario({ nomeUsuario: (u as any).nomeUsuario, email: (u as any).email, categoria: (u as any).categoria });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteUsuario((u as any).id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.usuarios.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ====== DIALOGS (CRIAÇÃO) ====== */}
      <Dialog open={openCreateFila} onOpenChange={setOpenCreateFila}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Nova Fila</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={createFila.nome || ''} onChange={(e) => setCreateFila((d) => ({ ...d, nome: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Setor</label>
                <Select value={(createFila as any).setorId || ''} onValueChange={(val) => setCreateFila((d) => ({ ...d, setorId: val }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={(s as any).id} value={(s as any).id}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Unidade</label>
                <Select value={(createFila as any).unidadeAtendimentoId || ''} onValueChange={(val) => setCreateFila((d) => ({ ...d, unidadeAtendimentoId: val }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((u) => (
                      <SelectItem key={(u as any).id} value={(u as any).id}>{u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateFila(false)}>Cancelar</Button>
            <Button onClick={addFila}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreateUnidade} onOpenChange={setOpenCreateUnidade}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Nova Unidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={createUnidade.nome || ''} onChange={(e) => setCreateUnidade((d) => ({ ...d, nome: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateUnidade(false)}>Cancelar</Button>
            <Button onClick={addUnidade}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreateSetor} onOpenChange={setOpenCreateSetor}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Novo Setor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={createSetor.nome || ''} onChange={(e) => setCreateSetor((d) => ({ ...d, nome: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateSetor(false)}>Cancelar</Button>
            <Button onClick={addSetor}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreateCliente} onOpenChange={setOpenCreateCliente}>
        <DialogContent className="sm:max-w-[820px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="CPF" value={createCliente.cpf || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, cpf: e.target.value }))} />
              <Input placeholder="Nome" value={createCliente.nome || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, nome: e.target.value }))} className="md:col-span-2" />
              <Input placeholder="Email" type="email" value={createCliente.email || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, email: e.target.value }))} className="md:col-span-3" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Telefones</div>
              <div className="space-y-2">
                {((createCliente.telefones as Telefone[]) || []).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="DDD"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      className="w-16"
                      value={(t.ddd ?? '').toString()}
                      onChange={(e) => {
                        const only = e.target.value.replace(/\D/g, '').slice(0,3);
                        const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                        arr[idx] = { ...arr[idx], ddd: Number(only) } as Telefone;
                        setCreateCliente((d) => ({ ...d, telefones: arr }));
                      }}
                    />
                    <Input
                      placeholder="Número"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      className="w-44"
                      value={(t.numero ?? '').toString()}
                      onChange={(e) => {
                        const only = e.target.value.replace(/\D/g, '').slice(0,11);
                        const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                        arr[idx] = { ...arr[idx], numero: Number(only) } as Telefone;
                        setCreateCliente((d) => ({ ...d, telefones: arr }));
                      }}
                    />
                    <Select value={t.tipo || 'CELULAR'} onValueChange={(val) => {
                      const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                      arr[idx] = { ...arr[idx], tipo: val as Telefone['tipo'] } as Telefone;
                      setCreateCliente((d) => ({ ...d, telefones: arr }));
                    }}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CELULAR">CELULAR</SelectItem>
                        <SelectItem value="FIXO">FIXO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => {
                      const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                      arr.splice(idx, 1);
                      setCreateCliente((d) => ({ ...d, telefones: arr }));
                    }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                arr.push({ ddd: 11, numero: 0, tipo: 'CELULAR' });
                setCreateCliente((d) => ({ ...d, telefones: arr }));
              }}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar telefone
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Endereço</div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <Input placeholder="CEP" value={(createCliente.endereco as any)?.cep || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), cep: e.target.value } }))} className="md:col-span-2" />
                <div className="md:col-span-1">
                  <Select value={(createCliente.endereco as any)?.uf || ''} onValueChange={(val) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), uf: val as any } }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZIL_UFS.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Cidade" value={(createCliente.endereco as any)?.cidade || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), cidade: e.target.value } }))} className="md:col-span-3" />
                <Input placeholder="Bairro" value={(createCliente.endereco as any)?.bairro || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), bairro: e.target.value } }))} className="md:col-span-3" />
                <Input placeholder="Logradouro" value={(createCliente.endereco as any)?.logradouro || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), logradouro: e.target.value } }))} className="md:col-span-4" />
                <Input placeholder="Número" value={(createCliente.endereco as any)?.numero || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), numero: e.target.value } }))} className="md:col-span-2" />
                <Input placeholder="Complemento" value={(createCliente.endereco as any)?.complemento || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), complemento: e.target.value } }))} className="md:col-span-6" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateCliente(false)}>Cancelar</Button>
            <Button onClick={addCliente}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreateUsuario} onOpenChange={setOpenCreateUsuario}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Nome de usuário" value={createUsuario.nomeUsuario || ''} onChange={(e) => setCreateUsuario((d) => ({ ...d, nomeUsuario: e.target.value }))} />
            <Input placeholder="Email" type="email" value={createUsuario.email || ''} onChange={(e) => setCreateUsuario((d) => ({ ...d, email: e.target.value }))} />
            <Select value={(createUsuario.categoria as any) || 'USUARIO'} onValueChange={(val) => setCreateUsuario((d) => ({ ...d, categoria: val as any }))}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                <SelectItem value="USUARIO">USUARIO</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Senha" type="password" value={createUsuario.senha || ''} onChange={(e) => setCreateUsuario((d) => ({ ...d, senha: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateUsuario(false)}>Cancelar</Button>
            <Button onClick={addUsuario}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== DIALOGS (EDIÇÃO) ====== */}
      <Dialog open={!!editFilaId} onOpenChange={(o) => { if (!o) { setEditFilaId(null); setDraftFila({}); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>Editar Fila</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={draftFila.nome || ''} onChange={(e) => setDraftFila((d) => ({ ...d, nome: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Setor</label>
                <Select value={(draftFila as any).setorId || ''} onValueChange={(val) => setDraftFila((d) => ({ ...d, setorId: val as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (<SelectItem key={(s as any).id} value={(s as any).id}>{s.nome}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Unidade</label>
                <Select value={(draftFila as any).unidadeAtendimentoId || ''} onValueChange={(val) => setDraftFila((d) => ({ ...d, unidadeAtendimentoId: val as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {unidades.map((u) => (<SelectItem key={(u as any).id} value={(u as any).id}>{u.nome}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditFilaId(null); setDraftFila({}); }}>Cancelar</Button>
            <Button onClick={saveFila}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUnidadeId} onOpenChange={(o) => { if (!o) { setEditUnidadeId(null); setDraftUnidade({}); } }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>Editar Unidade</DialogTitle></DialogHeader>
          <Input placeholder="Nome" value={draftUnidade.nome || ''} onChange={(e) => setDraftUnidade((d) => ({ ...d, nome: e.target.value }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditUnidadeId(null); setDraftUnidade({}); }}>Cancelar</Button>
            <Button onClick={saveUnidade}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSetorId} onOpenChange={(o) => { if (!o) { setEditSetorId(null); setDraftSetor({}); } }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>Editar Setor</DialogTitle></DialogHeader>
          <Input placeholder="Nome" value={draftSetor.nome || ''} onChange={(e) => setDraftSetor((d) => ({ ...d, nome: e.target.value }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditSetorId(null); setDraftSetor({}); }}>Cancelar</Button>
            <Button onClick={saveSetor}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editClienteId} onOpenChange={(o) => { if (!o) { setEditClienteId(null); setDraftCliente({}); } }}>
        <DialogContent className="sm:max-w-[860px]">
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="CPF" value={(draftCliente.cpf as any) || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, cpf: e.target.value }))} />
              <Input placeholder="Nome" value={draftCliente.nome || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, nome: e.target.value }))} className="md:col-span-2" />
              <Input placeholder="Email" type="email" value={draftCliente.email || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, email: e.target.value }))} className="md:col-span-3" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Telefones</div>
              <div className="space-y-2">
                {(((draftCliente.telefones as Telefone[]) || []) as Telefone[]).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="DDD"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      className="w-16"
                      value={(t.ddd ?? '').toString()}
                      onChange={(e) => {
                        const base = [ ...(((draftCliente.telefones as Telefone[]) || []) as Telefone[]) ];
                        const only = e.target.value.replace(/\D/g, '').slice(0,3);
                        base[idx] = { ...base[idx], ddd: Number(only) } as Telefone;
                        setDraftCliente((d) => ({ ...d, telefones: base }));
                      }}
                    />
                    <Input
                      placeholder="Número"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      className="w-44"
                      value={(t.numero ?? '').toString()}
                      onChange={(e) => {
                        const base = [ ...(((draftCliente.telefones as Telefone[]) || []) as Telefone[]) ];
                        const only = e.target.value.replace(/\D/g, '').slice(0,11);
                        base[idx] = { ...base[idx], numero: Number(only) } as Telefone;
                        setDraftCliente((d) => ({ ...d, telefones: base }));
                      }}
                    />
                    <Select value={t.tipo || 'CELULAR'} onValueChange={(val) => {
                      const base = [ ...(((draftCliente.telefones as Telefone[]) || []) as Telefone[]) ];
                      base[idx] = { ...base[idx], tipo: val as Telefone['tipo'] } as Telefone;
                      setDraftCliente((d) => ({ ...d, telefones: base }));
                    }}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CELULAR">CELULAR</SelectItem>
                        <SelectItem value="FIXO">FIXO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => {
                      const base = [ ...(((draftCliente.telefones as Telefone[]) || []) as Telefone[]) ];
                      base.splice(idx, 1);
                      setDraftCliente((d) => ({ ...d, telefones: base }));
                    }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                const base = [ ...(((draftCliente.telefones as Telefone[]) || []) as Telefone[]) ];
                base.push({ ddd: 11, numero: 0, tipo: 'CELULAR' });
                setDraftCliente((d) => ({ ...d, telefones: base }));
              }}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar telefone
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Endereço</div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <Input placeholder="CEP" value={(draftCliente.endereco as any)?.cep || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), cep: e.target.value } }))} className="md:col-span-2" />
                <div className="md:col-span-1">
                  <Select value={(draftCliente.endereco as any)?.uf || ''} onValueChange={(val) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), uf: val as any } }))}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {BRAZIL_UFS.map((uf) => (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Cidade" value={(draftCliente.endereco as any)?.cidade || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), cidade: e.target.value } }))} className="md:col-span-3" />
                <Input placeholder="Bairro" value={(draftCliente.endereco as any)?.bairro || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), bairro: e.target.value } }))} className="md:col-span-3" />
                <Input placeholder="Logradouro" value={(draftCliente.endereco as any)?.logradouro || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), logradouro: e.target.value } }))} className="md:col-span-4" />
                <Input placeholder="Número" value={(draftCliente.endereco as any)?.numero || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), numero: e.target.value } }))} className="md:col-span-2" />
                <Input placeholder="Complemento" value={(draftCliente.endereco as any)?.complemento || ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || {}), complemento: e.target.value } }))} className="md:col-span-6" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditClienteId(null); setDraftCliente({}); }}>Cancelar</Button>
            <Button onClick={saveCliente}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUsuarioId} onOpenChange={(o) => { if (!o) { setEditUsuarioId(null); setDraftUsuario({}); } }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Nome de usuário" value={draftUsuario.nomeUsuario || ''} onChange={(e) => setDraftUsuario((d) => ({ ...d, nomeUsuario: e.target.value }))} />
            <Input placeholder="Email" type="email" value={draftUsuario.email || ''} onChange={(e) => setDraftUsuario((d) => ({ ...d, email: e.target.value }))} />
            <Select value={(draftUsuario.categoria as any) || 'USUARIO'} onValueChange={(val) => setDraftUsuario((d) => ({ ...d, categoria: val as any }))}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                <SelectItem value="USUARIO">USUARIO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditUsuarioId(null); setDraftUsuario({}); }}>Cancelar</Button>
            <Button onClick={saveUsuario}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Gestao;
