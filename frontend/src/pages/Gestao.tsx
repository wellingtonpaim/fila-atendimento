import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Search, Pencil, Trash2, Save, X } from 'lucide-react';
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

  const { toast } = useToast();

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
            .listarPorUnidade(u.id)
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
      { value: 'setorId', label: 'Setor (ID)' },
      { value: 'unidadeAtendimentoId', label: 'Unidade (ID)' },
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
        nome: draftCliente.nome,
        email: draftCliente.email,
        cpf: draftCliente.cpf,
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
      const payload: FilaUpdateDTO = {
        nome: draftFila.nome || '',
        setorId: draftFila.setorId || (filas.find((f) => f.id === editFilaId)?.setorId as any),
        unidadeAtendimentoId:
          draftFila.unidadeAtendimentoId || (filas.find((f) => f.id === editFilaId)?.unidadeAtendimentoId as any),
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
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Setor ID</TableHead>
                      <TableHead>Unidade ID</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
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
                            <Input
                              value={draftFila.setorId ?? (f as any).setorId ?? ''}
                              onChange={(e) => setDraftFila((d) => ({ ...d, setorId: e.target.value }))}
                            />
                          ) : (
                            <span>{(f as any).setorId}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editFilaId === f.id ? (
                            <Input
                              value={
                                draftFila.unidadeAtendimentoId ?? (f as any).unidadeAtendimentoId ?? ''
                              }
                              onChange={(e) =>
                                setDraftFila((d) => ({ ...d, unidadeAtendimentoId: e.target.value }))
                              }
                            />
                          ) : (
                            <span>{(f as any).unidadeAtendimentoId}</span>
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
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CPF</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.clientes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          {editClienteId === c.id ? (
                            <Input
                              value={draftCliente.cpf ?? (c as any).cpf ?? ''}
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
                                  setDraftCliente({ cpf: (c as any).cpf, nome: (c as any).nome, email: (c as any).email });
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
                    {filtered.clientes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
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
    </div>
  );
};

export default Gestao;
