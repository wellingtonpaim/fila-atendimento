// Tipos principais do sistema Q-Manager - Atualizados para corresponder à API Java

// ====== RESPOSTA PADRÃO DA API ======
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
    timestamp?: string;
}

// ====== ENDEREÇO ======
export interface Endereco {
    cep?: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';
    enderecoFormatado?: string;
}

// ====== TELEFONE ======
export interface Telefone {
    tipo: 'FIXO' | 'CELULAR';
    ddd: number;
    numero: number;
}

// ====== AUTENTICAÇÃO ======
export interface LoginRequest {
    username: string; // Mudou de email para username
    password: string; // Mudou de senha para password
    unidadeAtendimentoId: string; // UUID
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: string; // JWT Token
}

// ====== UNIDADE DE ATENDIMENTO ======
export interface UnidadeAtendimentoPublicDTO {
    id: string; // UUID
    nome: string;
}

export interface UnidadeAtendimentoResponseDTO {
    id: string; // UUID
    nome: string;
    endereco?: Endereco;
    telefones?: Telefone[];
}

export interface UnidadeAtendimentoCreateDTO {
    nome: string;
    endereco?: Endereco;
    telefones?: Telefone[];
}

export interface UnidadeAtendimentoUpdateDTO {
    nome?: string;
    endereco?: Endereco;
    telefones?: Telefone[];
}

// ====== USUÁRIO ======
export interface UsuarioResponseDTO {
    id: string; // UUID
    nomeUsuario: string;
    email: string;
    categoria: 'ADMINISTRADOR' | 'USUARIO';
    unidadesIds: string[]; // Array de UUIDs
}

export interface UsuarioCreateDTO {
    nomeUsuario: string;
    email: string;
    senha: string;
    categoria: 'ADMINISTRADOR' | 'USUARIO';
    unidadesIds?: string[];
}

export interface UsuarioUpdateDTO {
    nomeUsuario?: string;
    email?: string;
    categoria: 'ADMINISTRADOR' | 'USUARIO';
    unidadesIds?: string[];
}

// ====== SETOR ======
export interface SetorResponseDTO {
    id: string; // UUID
    nome: string;
}

export interface SetorCreateDTO {
    nome: string;
}

export interface SetorUpdateDTO {
    nome?: string;
}

// ====== CLIENTE ======
export interface ClienteResponseDTO {
    id: string; // UUID
    cpf: string;
    nome: string;
    email: string;
    telefones?: Telefone[];
    endereco?: Endereco;
}

export interface ClienteCreateDTO {
    cpf: string;
    nome: string;
    email: string;
    telefones?: Telefone[];
    endereco?: Endereco;
}

export interface ClienteUpdateDTO {
    cpf?: string;
    nome?: string;
    email?: string;
    telefones?: Telefone[];
    endereco?: Endereco;
}

// ====== FILA ======
export interface FilaResponseDTO {
    id: string; // UUID
    nome: string;
    setor: SetorResponseDTO;
    unidade: UnidadeAtendimentoResponseDTO;
}

export interface FilaCreateDTO {
    nome: string;
    setorId: string; // UUID
    unidadeAtendimentoId: string; // UUID
}

export interface FilaUpdateDTO {
    nome?: string;
}

// ====== ENTRADA FILA ======
export interface EntradaFilaResponseDTO {
    id: string; // UUID
    status: 'AGUARDANDO' | 'CHAMADO' | 'ATENDIDO' | 'CANCELADO';
    prioridade: boolean;
    isRetorno: boolean;
    dataHoraEntrada: string; // ISO DateTime
    dataHoraChamada?: string; // ISO DateTime
    dataHoraSaida?: string; // ISO DateTime
    guicheOuSalaAtendimento?: string;
    cliente: ClienteResponseDTO;
    fila: FilaResponseDTO;
    usuarioResponsavelId?: string; // UUID
}

export interface EntradaFilaCreateDTO {
    clienteId: string; // UUID
    filaId: string; // UUID
    prioridade: boolean;
    isRetorno?: boolean;
}

// ====== PAINEL ======
export interface PainelResponseDTO {
    id: string; // UUID
    descricao: string;
    unidadeAtendimentoId: string; // UUID
}

export interface PainelCreateDTO {
    descricao: string;
    unidadeAtendimentoId: string; // UUID
}

export interface PainelUpdateDTO {
    descricao?: string;
    unidadeAtendimentoId?: string; // UUID
}

// ====== DASHBOARD ANALYTICS ======
export interface TempoEsperaDTO {
    filaNome: string;
    setorNome: string;
    unidadeNome: string;
    tempoMedioEsperaMinutos: number;
    periodoInicio: string; // ISO DateTime
    periodoFim: string; // ISO DateTime
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
    horario: string; // ISO DateTime
    quantidadeAtendimentos: number;
}

export interface FluxoPacientesDTO {
    unidadeNome: string;
    setorOrigem: string;
    setorDestino: string;
    quantidadePacientes: number;
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