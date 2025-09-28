import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
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
  SetorUpdateDTO,
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

  // Edição inline por entidade
  const [editUsuarioId, setEditUsuarioId] = useState<string | null>(null);
  const [draftUsuario, setDraftUsuario] = useState<Partial<UsuarioUpdateDTO>>({});

  const [editUnidadeId, setEditUnidadeId] = useState<string | null>(null);
  const [draftUnidade, setDraftUnidade] = useState<Partial<UnidadeAtendimentoUpdateDTO>>({});

  const [editSetorId, setEditSetorId] = useState<string | null>(null);
  const [draftSetor, setDraftSetor] = useState<Partial<SetorUpdateDTO>>({});

  const [editClienteId, setEditClienteId] = useState<string | null>(null);
  const [draftCliente, setDraftCliente] = useState<Partial<ClienteUpdateDTO>>({});

  const [editFilaId, setEditFilaId] = useState<string | null>(null);
  const [draftFila, setDraftFila] = useState<Partial<FilaUpdateDTO>>({});

  // Criação por entidade
  const [creatingFila, setCreatingFila] = useState(false);
  const [createFila, setCreateFila] = useState<Partial<FilaCreateDTO>>({ nome: '', setorId: '', unidadeAtendimentoId: '' });

  const [creatingUnidade, setCreatingUnidade] = useState(false);
  const [createUnidade, setCreateUnidade] = useState<Partial<UnidadeAtendimentoCreateDTO>>({ nome: '' });

  const [creatingSetor, setCreatingSetor] = useState(false);
  const [createSetor, setCreateSetor] = useState<Partial<SetorCreateDTO>>({ nome: '' });

  const [creatingCliente, setCreatingCliente] = useState(false);
  const [createCliente, setCreateCliente] = useState<Partial<ClienteCreateDTO>>({ cpf: '', nome: '', email: '' });

  const [creatingUsuario, setCreatingUsuario] = useState(false);
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

  // Ações salvar/cancelar por entidade
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
      const payload: SetorUpdateDTO = { nome: draftSetor.nome || '' } as SetorUpdateDTO;
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
        endereco: draftCliente.endereco as Endereco | undefined,
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

  // Ações deletar
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
      toast({ title: 'Unidade removida' });
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

  // Criação handlers
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
      setCreatingFila(false);
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
      setCreatingUnidade(false);
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
      setCreatingSetor(false);
      setCreateSetor({ nome: '' });
      toast({ title: 'Setor criado' });
    } catch (e: any) {
      toast({ title: 'Erro ao criar setor', description: e?.message || '', variant: 'destructive' });
    }
  };

  const addCliente = async () => {
    try {
      const payload: ClienteCreateDTO = {
        cpf: (createCliente.cpf || '').trim(),
        nome: (createCliente.nome || '').trim(),
        email: (createCliente.email || '').trim(),
        telefones: (createCliente.telefones as Telefone[]) || undefined,
        endereco: (createCliente.endereco as Endereco) || undefined,
      } as any;
      if (!payload.cpf || !payload.nome) {
        toast({ title: 'Informe ao menos CPF e Nome', variant: 'destructive' });
        return;
      }
      const created = await clienteService.criar(payload);
      setClientes((prev) => [created, ...prev]);
      setCreatingCliente(false);
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
      setCreatingUsuario(false);
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
                  <Button size="sm" onClick={() => setCreatingFila((v) => !v)}>
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
                    {creatingFila && (
                      <TableRow>
                        <TableCell>
                          <Input
                            value={createFila.nome || ''}
                            placeholder="Nome da fila"
                            onChange={(e) => setCreateFila((d) => ({ ...d, nome: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={(createFila as any).setorId || ''}
                            onValueChange={(val) => setCreateFila((d) => ({ ...d, setorId: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o setor" />
                            </SelectTrigger>
                            <SelectContent>
                              {setores.map((s) => (
                                <SelectItem key={(s as any).id} value={(s as any).id}>
                                  {s.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={(createFila as any).unidadeAtendimentoId || ''}
                            onValueChange={(val) => setCreateFila((d) => ({ ...d, unidadeAtendimentoId: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a unidade" />
                            </SelectTrigger>
                            <SelectContent>
                              {unidades.map((u) => (
                                <SelectItem key={(u as any).id} value={(u as any).id}>
                                  {u.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={addFila}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCreatingFila(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {filtered.filas.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          {editFilaId === f.id ? (
                            <Input
                              value={draftFila.nome ?? (f as any).nome ?? ''}
                              onChange={(e) => setDraftFila((d) => ({ ...d, nome: e.target.value }))}
                            />
                          ) : (
                            <span>{(f as any).nome}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editFilaId === f.id ? (
                            <Select
                              value={(draftFila as any).setorId ?? (f as any).setorId ?? ''}
                              onValueChange={(val) => setDraftFila((d) => ({ ...d, setorId: val as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {setores.map((s) => (
                                  <SelectItem key={(s as any).id} value={(s as any).id}>
                                    {s.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{getSetorNome((f as any).setorId)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editFilaId === f.id ? (
                            <Select
                              value={(draftFila as any).unidadeAtendimentoId ?? (f as any).unidadeAtendimentoId ?? ''}
                              onValueChange={(val) => setDraftFila((d) => ({ ...d, unidadeAtendimentoId: val as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {unidades.map((u) => (
                                  <SelectItem key={(u as any).id} value={(u as any).id}>
                                    {u.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{getUnidadeNome((f as any).unidadeAtendimentoId)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editFilaId === f.id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={saveFila}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditFilaId(null);
                                  setDraftFila({});
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditFilaId(f.id);
                                  setDraftFila({ nome: (f as any).nome, setorId: (f as any).setorId, unidadeAtendimentoId: (f as any).unidadeAtendimentoId });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteFila(f.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.filas.length === 0 && !creatingFila && (
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
                  <Button size="sm" onClick={() => setCreatingUnidade((v) => !v)}>
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
                    {creatingUnidade && (
                      <TableRow>
                        <TableCell>
                          <Input
                            value={createUnidade.nome || ''}
                            placeholder="Nome da unidade"
                            onChange={(e) => setCreateUnidade((d) => ({ ...d, nome: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={addUnidade}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCreatingUnidade(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {filtered.unidades.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          {editUnidadeId === u.id ? (
                            <Input
                              value={draftUnidade.nome ?? (u as any).nome ?? ''}
                              onChange={(e) => setDraftUnidade((d) => ({ ...d, nome: e.target.value }))}
                            />
                          ) : (
                            <span>{(u as any).nome}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editUnidadeId === u.id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={saveUnidade}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditUnidadeId(null);
                                  setDraftUnidade({});
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditUnidadeId(u.id);
                                  setDraftUnidade({ nome: (u as any).nome });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteUnidade(u.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.unidades.length === 0 && !creatingUnidade && (
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
                  <Button size="sm" onClick={() => setCreatingSetor((v) => !v)}>
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
                    {creatingSetor && (
                      <TableRow>
                        <TableCell>
                          <Input
                            value={createSetor.nome || ''}
                            placeholder="Nome do setor"
                            onChange={(e) => setCreateSetor((d) => ({ ...d, nome: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={addSetor}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCreatingSetor(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {filtered.setores.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          {editSetorId === s.id ? (
                            <Input
                              value={draftSetor.nome ?? (s as any).nome ?? ''}
                              onChange={(e) => setDraftSetor((d) => ({ ...d, nome: e.target.value }))}
                            />
                          ) : (
                            <span>{(s as any).nome}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editSetorId === s.id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={saveSetor}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditSetorId(null);
                                  setDraftSetor({});
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditSetorId(s.id);
                                  setDraftSetor({ nome: (s as any).nome });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteSetor(s.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.setores.length === 0 && !creatingSetor && (
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
                  <Button size="sm" onClick={() => setCreatingCliente((v) => !v)}>
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
                    {creatingCliente && (
                      <TableRow>
                        <TableCell>
                          <Input
                            value={createCliente.cpf || ''}
                            placeholder="CPF"
                            onChange={(e) => setCreateCliente((d) => ({ ...d, cpf: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={createCliente.nome || ''}
                            placeholder="Nome"
                            onChange={(e) => setCreateCliente((d) => ({ ...d, nome: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={createCliente.email || ''}
                            placeholder="Email"
                            onChange={(e) => setCreateCliente((d) => ({ ...d, email: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {((createCliente.telefones as Telefone[]) || []).map((t, idx) => (
                              <div key={idx} className="grid grid-cols-3 gap-2">
                                <Input
                                  placeholder="DDD"
                                  type="number"
                                  value={t.ddd ?? ''}
                                  onChange={(e) => {
                                    const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                                    arr[idx] = { ...arr[idx], ddd: Number(e.target.value) } as Telefone;
                                    setCreateCliente((d) => ({ ...d, telefones: arr }));
                                  }}
                                />
                                <Input
                                  placeholder="Número"
                                  type="number"
                                  value={t.numero ?? ''}
                                  onChange={(e) => {
                                    const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                                    arr[idx] = { ...arr[idx], numero: Number(e.target.value) } as Telefone;
                                    setCreateCliente((d) => ({ ...d, telefones: arr }));
                                  }}
                                />
                                <Select
                                  value={t.tipo || 'CELULAR'}
                                  onValueChange={(val) => {
                                    const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                                    arr[idx] = { ...arr[idx], tipo: val as Telefone['tipo'] } as Telefone;
                                    setCreateCliente((d) => ({ ...d, telefones: arr }));
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CELULAR">CELULAR</SelectItem>
                                    <SelectItem value="FIXO">FIXO</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const arr = [ ...((createCliente.telefones as Telefone[]) || []) ];
                                arr.push({ ddd: 11, numero: 0, tipo: 'CELULAR' });
                                setCreateCliente((d) => ({ ...d, telefones: arr }));
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Telefone
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="CEP" value={(createCliente.endereco as any)?.cep || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), cep: e.target.value } }))} />
                            <Input placeholder="UF" value={(createCliente.endereco as any)?.uf || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), uf: e.target.value as any } }))} />
                            <Input placeholder="Cidade" value={(createCliente.endereco as any)?.cidade || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), cidade: e.target.value } }))} />
                            <Input placeholder="Bairro" value={(createCliente.endereco as any)?.bairro || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), bairro: e.target.value } }))} />
                            <Input placeholder="Logradouro" value={(createCliente.endereco as any)?.logradouro || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), logradouro: e.target.value } }))} />
                            <Input placeholder="Número" value={(createCliente.endereco as any)?.numero || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), numero: e.target.value } }))} />
                            <Input placeholder="Compl." value={(createCliente.endereco as any)?.complemento || ''} onChange={(e) => setCreateCliente((d) => ({ ...d, endereco: { ...(d.endereco as any), complemento: e.target.value } }))} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={addCliente}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCreatingCliente(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {filtered.clientes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          {editClienteId === c.id ? (
                            <Input
                              value={(draftCliente.cpf as any) ?? (c as any).cpf ?? ''}
                              onChange={(e) => setDraftCliente((d) => ({ ...d, cpf: e.target.value }))}
                            />
                          ) : (
                            <span>{(c as any).cpf}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editClienteId === c.id ? (
                            <Input
                              value={draftCliente.nome ?? (c as any).nome ?? ''}
                              onChange={(e) => setDraftCliente((d) => ({ ...d, nome: e.target.value }))}
                            />
                          ) : (
                            <span>{(c as any).nome}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editClienteId === c.id ? (
                            <Input
                              value={draftCliente.email ?? (c as any).email ?? ''}
                              onChange={(e) => setDraftCliente((d) => ({ ...d, email: e.target.value }))}
                            />
                          ) : (
                            <span>{(c as any).email}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editClienteId === c.id ? (
                            <div className="space-y-2">
                              {(((draftCliente.telefones as Telefone[]) || (c as any).telefones || []) as Telefone[]).map((t, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2">
                                  <Input
                                    placeholder="DDD"
                                    type="number"
                                    value={t.ddd ?? ''}
                                    onChange={(e) => {
                                      const base = [ ...(((draftCliente.telefones as Telefone[]) || (c as any).telefones || []) as Telefone[]) ];
                                      base[idx] = { ...base[idx], ddd: Number(e.target.value) } as Telefone;
                                      setDraftCliente((d) => ({ ...d, telefones: base }));
                                    }}
                                  />
                                  <Input
                                    placeholder="Número"
                                    type="number"
                                    value={t.numero ?? ''}
                                    onChange={(e) => {
                                      const base = [ ...(((draftCliente.telefones as Telefone[]) || (c as any).telefones || []) as Telefone[]) ];
                                      base[idx] = { ...base[idx], numero: Number(e.target.value) } as Telefone;
                                      setDraftCliente((d) => ({ ...d, telefones: base }));
                                    }}
                                  />
                                  <Select
                                    value={t.tipo || 'CELULAR'}
                                    onValueChange={(val) => {
                                      const base = [ ...(((draftCliente.telefones as Telefone[]) || (c as any).telefones || []) as Telefone[]) ];
                                      base[idx] = { ...base[idx], tipo: val as Telefone['tipo'] } as Telefone;
                                      setDraftCliente((d) => ({ ...d, telefones: base }));
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="CELULAR">CELULAR</SelectItem>
                                      <SelectItem value="FIXO">FIXO</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const base = [ ...(((draftCliente.telefones as Telefone[]) || (c as any).telefones || []) as Telefone[]) ];
                                    base.push({ ddd: 11, numero: 0, tipo: 'CELULAR' });
                                    setDraftCliente((d) => ({ ...d, telefones: base }));
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Telefone
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span>{formatTelefones((c as any).telefones)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editClienteId === c.id ? (
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="CEP" value={(draftCliente.endereco as any)?.cep ?? (c as any)?.endereco?.cep ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), cep: e.target.value } }))} />
                              <Input placeholder="UF" value={(draftCliente.endereco as any)?.uf ?? (c as any)?.endereco?.uf ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), uf: e.target.value as any } }))} />
                              <Input placeholder="Cidade" value={(draftCliente.endereco as any)?.cidade ?? (c as any)?.endereco?.cidade ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), cidade: e.target.value } }))} />
                              <Input placeholder="Bairro" value={(draftCliente.endereco as any)?.bairro ?? (c as any)?.endereco?.bairro ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), bairro: e.target.value } }))} />
                              <Input placeholder="Logradouro" value={(draftCliente.endereco as any)?.logradouro ?? (c as any)?.endereco?.logradouro ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), logradouro: e.target.value } }))} />
                              <Input placeholder="Número" value={(draftCliente.endereco as any)?.numero ?? (c as any)?.endereco?.numero ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), numero: e.target.value } }))} />
                              <Input placeholder="Compl." value={(draftCliente.endereco as any)?.complemento ?? (c as any)?.endereco?.complemento ?? ''} onChange={(e) => setDraftCliente((d) => ({ ...d, endereco: { ...((d.endereco as any) || (c as any).endereco || {}), complemento: e.target.value } }))} />
                            </div>
                          ) : (
                            <span>{formatEndereco((c as any).endereco)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editClienteId === c.id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={saveCliente}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditClienteId(null);
                                  setDraftCliente({});
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditClienteId(c.id);
                                  setDraftCliente({ cpf: (c as any).cpf, nome: (c as any).nome, email: (c as any).email, telefones: (c as any).telefones, endereco: (c as any).endereco});
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteCliente(c.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.clientes.length === 0 && !creatingCliente && (
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
                  <Button size="sm" onClick={() => setCreatingUsuario((v) => !v)}>
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
                    {creatingUsuario && (
                      <TableRow>
                        <TableCell>
                          <Input
                            placeholder="Nome de usuário"
                            value={createUsuario.nomeUsuario || ''}
                            onChange={(e) => setCreateUsuario((d) => ({ ...d, nomeUsuario: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Email"
                            value={createUsuario.email || ''}
                            onChange={(e) => setCreateUsuario((d) => ({ ...d, email: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              value={(createUsuario.categoria as any) || 'USUARIO'}
                              onValueChange={(val) => setCreateUsuario((d) => ({ ...d, categoria: val as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                                <SelectItem value="USUARIO">USUARIO</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Input
                              type="password"
                              className="max-w-[160px]"
                              placeholder="Senha"
                              value={createUsuario.senha || ''}
                              onChange={(e) => setCreateUsuario((d) => ({ ...d, senha: e.target.value }))}
                            />
                            <Button size="sm" onClick={addUsuario}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setCreatingUsuario(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {filtered.usuarios.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          {editUsuarioId === u.id ? (
                            <Input
                              value={draftUsuario.nomeUsuario ?? (u as any).nomeUsuario ?? ''}
                              onChange={(e) => setDraftUsuario((d) => ({ ...d, nomeUsuario: e.target.value }))}
                            />
                          ) : (
                            <span>{(u as any).nomeUsuario}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editUsuarioId === u.id ? (
                            <Input
                              value={draftUsuario.email ?? (u as any).email ?? ''}
                              onChange={(e) => setDraftUsuario((d) => ({ ...d, email: e.target.value }))}
                            />
                          ) : (
                            <span>{(u as any).email}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editUsuarioId === u.id ? (
                            <Select
                              value={(draftUsuario.categoria as any) ?? ((u as any).categoria as any) ?? 'USUARIO'}
                              onValueChange={(val) => setDraftUsuario((d) => ({ ...d, categoria: val as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                                <SelectItem value="USUARIO">USUARIO</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{(u as any).categoria}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editUsuarioId === u.id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={saveUsuario}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditUsuarioId(null);
                                  setDraftUsuario({});
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditUsuarioId(u.id);
                                  setDraftUsuario({ nomeUsuario: (u as any).nomeUsuario, email: (u as any).email, categoria: (u as any).categoria });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteUsuario(u.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.usuarios.length === 0 && !creatingUsuario && (
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
    </div>
  );
};

export default Gestao;
