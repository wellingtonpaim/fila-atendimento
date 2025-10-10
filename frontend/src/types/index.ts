// Tipos principais do sistema Q-Manager - Atualizados para corresponder à API Java

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


// ===== API Response wrapper (padrão backend) =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
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

export interface ClienteCreateDTO {
  cpf: string;
  nome: string;
  email?: string;
  telefones?: Telefone[];
  endereco?: Endereco;
}

export interface PainelCreateDTO {
    descricao: string;
    unidadeAtendimentoId: string;
    filasIds?: string[];
}

export interface EntradaFilaCreateDTO {
    clienteId: string;
    filaId: string;
    prioridade: boolean;
    isRetorno?: boolean;
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

export interface ClienteResponseDTO {
  id: string;
  cpf: string;
  nome: string;
  email?: string;
  telefones?: Telefone[];
  endereco?: Endereco;
}

export interface PainelResponseDTO {
    id: string;
    descricao: string;
    unidadeAtendimentoId: string;
    filasIds: string[];
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

export interface ClienteUpdateDTO {
  cpf?: string;
  nome?: string;
  email?: string;
  telefones?: Telefone[];
  endereco?: Endereco;
}

export interface PainelUpdateDTO {
    descricao: string;
    unidadeAtendimentoId: string;
    filasIds: string[];
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
    entradaFilaId: string;
    clienteNome: string;
    senha: string;
    filaId: string;
    filaNome: string;
    setorNome: string;
    guicheOuSalaAtendimento: string;
    timestamp: string; // ISO DateTime
}

export interface PainelPublicoChamadaDTO {
  nomePaciente: string;
  guicheOuSala: string;
  dataHoraChamada: string; // ISO DateTime
}

export interface PainelPublicoDTO {
  filaId: string;
  chamadaAtual: PainelPublicoChamadaDTO | null;
  ultimasChamadas: PainelPublicoChamadaDTO[];
  mensagemVocalizacao?: string;
  tempoExibicao?: number; // segundos para destaque/exibição principal
  repeticoes?: number; // número de repetições da mensagem de voz
  intervaloRepeticao?: number; // intervalo em segundos entre repetições
  sinalizacaoSonora?: boolean; // se true e houver mensagem, disparar áudio
}

// ====== TIPOS NOVOS (públicos/auxiliares) ======
// Unidade pública para tela de login (endpoint público)
export interface UnidadeAtendimentoPublicDTO {
  id: string;
  nome: string;
}

// Payload de login, conforme backend (/auth/login com query params)
export interface LoginRequest {
  username: string;
  password: string;
  unidadeAtendimentoId: string;
}

// DTO público para obter a configuração de um painel
export interface PainelPublicoConfigDTO {
    id: string;
    descricao: string;
    filas: FilaResponseDTO[];
}

// ====== DASHBOARD DTOs ======
export interface TempoEsperaDTO {
  filaNome: string;
  setorNome: string;
  unidadeNome: string;
  tempoMedioEsperaMinutos: number;
  periodoInicio: string; // ISO date-time
  periodoFim: string; // ISO date-time
}

export interface ProdutividadeDTO {
  profissionalNome: string;
  setorNome: string;
  unidadeNome: string;
  atendimentosRealizados: number;
  tempoMedioAtendimentoMinutos: number;
}

export interface HorarioPicoDTO {
  unidadeNome: string;
  setorNome: string;
  horario: string; // ISO date-time
  quantidadeAtendimentos: number;
}

export interface FluxoPacientesDTO {
  unidadeNome: string;
  setorOrigem: string;
  setorDestino: string;
  quantidadePacientes: number;
}
