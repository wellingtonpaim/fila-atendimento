// Tipos principais do sistema Q-Manager - Atualizados para corresponder à API Java

// ====== RESPOSTA PADRÃO DA API ======
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Enums
export enum CategoriaUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  USUARIO = 'USUARIO'
}

export enum TipoTelefone {
  FIXO = 'FIXO',
  CELULAR = 'CELULAR'
}

export enum UF {
  AC = 'AC', AL = 'AL', AP = 'AP', AM = 'AM', BA = 'BA', CE = 'CE',
  DF = 'DF', ES = 'ES', GO = 'GO', MA = 'MA', MT = 'MT', MS = 'MS',
  MG = 'MG', PA = 'PA', PB = 'PB', PR = 'PR', PE = 'PE', PI = 'PI',
  RJ = 'RJ', RN = 'RN', RS = 'RS', RO = 'RO', RR = 'RR', SC = 'SC',
  SP = 'SP', SE = 'SE', TO = 'TO'
}

// Interfaces para DTOs
export interface Telefone {
  tipo: TipoTelefone;
  ddd: number;
  numero: number;
}

export interface Endereco {
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: UF;
  enderecoFormatado?: string;
}

// DTOs de criação
export interface FilaCreateDTO {
  nome: string;
  setorId: string;
  unidadeAtendimentoId: string;
}

export interface UnidadeAtendimentoCreateDTO {
  nome: string;
  endereco?: Endereco;
  telefones?: Telefone[];
}

export interface SetorCreateDTO {
  nome: string;
}

export interface UsuarioCreateDTO {
  nomeUsuario: string;
  email: string;
  senha: string;
  categoria: CategoriaUsuario;
  unidadesIds?: string[];
}

// DTOs de resposta
export interface SetorResponseDTO {
  id: string;
  nome: string;
}

export interface UnidadeAtendimentoResponseDTO {
  id: string;
  nome: string;
  endereco?: Endereco;
  telefones?: Telefone[];
}

export interface UsuarioResponseDTO {
  id: string;
  nomeUsuario: string;
  email: string;
  categoria: CategoriaUsuario;
  unidadesIds?: string[];
}

export interface FilaResponseDTO {
  id: string;
  nome: string;
  setor: SetorResponseDTO;
  unidade: UnidadeAtendimentoResponseDTO;
}

// DTOs de atualização
export interface FilaUpdateDTO {
  nome?: string;
  setorId?: string;
  unidadeAtendimentoId?: string;
}

export interface UnidadeAtendimentoUpdateDTO {
  nome?: string;
  endereco?: Endereco;
  telefones?: Telefone[];
}

export interface SetorUpdateDTO {
  nome?: string;
}

export interface UsuarioUpdateDTO {
  nomeUsuario?: string;
  email?: string;
  categoria?: CategoriaUsuario;
  unidadesIds?: string[];
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

// Outros tipos que podem existir
export interface ClienteResponseDTO {
  id: string;
  cpf: string;
  nome: string;
  email?: string;
  telefones?: Telefone[];
  endereco?: Endereco;
}

export interface EntradaFilaResponseDTO {
  id: string;
  status: 'AGUARDANDO' | 'CHAMADO' | 'ATENDIDO' | 'CANCELADO';
  prioridade: boolean;
  isRetorno?: boolean;
  dataHoraEntrada: string;
  dataHoraChamada?: string;
  dataHoraSaida?: string;
  guicheOuSalaAtendimento?: string;
  cliente: ClienteResponseDTO;
  fila: FilaResponseDTO;
  usuarioResponsavelId?: string;
}

// ====== EMAIL ======
export interface EmailRequestDTO {
    subject: string;
    body: string;
    to: string;
    from: string;
}

// ====== WEBSOCKET ======
export interface ChamadaWebSocket {
    entradaFilaId: string; // UUID
    clienteNome: string;
    senha: string;
    filaId: string; // UUID
    filaNome: string;
    setorNome: string;
    guicheOuSalaAtendimento: string;
    timestamp: string; // ISO DateTime
}

// ====== TIPOS LEGADOS (para compatibilidade) ======
// Mantendo para não quebrar código existente, mas marcados como deprecated
/** @deprecated Use UsuarioResponseDTO instead */
export interface Usuario {
    id: number;
    nome: string;
    email: string;
    categoria: 'ADMINISTRADOR' | 'USUARIO';
    ativo: boolean;
    unidadesAtendimento: UnidadeAtendimento[];
}

/** @deprecated Use UnidadeAtendimentoResponseDTO instead */
export interface UnidadeAtendimento {
    id: number;
    nome: string;
    endereco: string;
    telefone: string;
    email: string;
    ativo: boolean;
}

/** @deprecated Use SetorResponseDTO instead */
export interface Setor {
    id: number;
    nome: string;
    descricao: string;
    cor: string;
    unidadeAtendimento: UnidadeAtendimento;
    ativo: boolean;
}

/** @deprecated Use FilaResponseDTO instead */
export interface Fila {
    id: number;
    nome: string;
    setor: Setor;
    prioridade: number;
    tempoEstimadoAtendimento: number;
    ativo: boolean;
}

/** @deprecated Use ClienteResponseDTO instead */
export interface Cliente {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: string;
    ativo: boolean;
}

/** @deprecated Use EntradaFilaResponseDTO instead */
export interface EntradaFila {
    id: number;
    cliente: Cliente;
    fila: Fila;
    senha: string;
    horarioEntrada: string;
    horarioChamada?: string;
    horarioFinalizacao?: string;
    status: 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'FINALIZADO' | 'CANCELADO';
    prioridade: boolean;
    observacoes?: string;
}

/** @deprecated Use PainelResponseDTO instead */
export interface Painel {
    id: number;
    nome: string;
    descricao: string;
    unidadeAtendimento: UnidadeAtendimento;
    filasVinculadas: Fila[];
    ativo: boolean;
}

/** @deprecated Use UnidadeAtendimentoPublicDTO instead */
export interface UnidadeAtendimentoLogin {
    id: string;
    nome: string;
}