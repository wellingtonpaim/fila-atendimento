// Tipos principais do sistema Q-Manager
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Novo tipo para unidades retornadas pelo endpoint público de login
export interface UnidadeAtendimentoLogin {
    id: string;
    nome: string;
}

export interface LoginRequest {
    email: string;
    senha: string;
    unidadeId: string; // Alterado para string (UUID)
}

export interface LoginResponse {
    token: string;
    usuario: Usuario;
    unidade: UnidadeAtendimento;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    categoria: 'ADMINISTRADOR' | 'USUARIO';
    ativo: boolean;
    unidadesAtendimento: UnidadeAtendimento[];
}

export interface UnidadeAtendimento {
    id: number;
    nome: string;
    endereco: string;
    telefone: string;
    email: string;
    ativo: boolean;
}

export interface Setor {
    id: number;
    nome: string;
    descricao: string;
    cor: string;
    unidadeAtendimento: UnidadeAtendimento;
    ativo: boolean;
}

export interface Fila {
    id: number;
    nome: string;
    setor: Setor;
    prioridade: number;
    tempoEstimadoAtendimento: number;
    ativo: boolean;
}

export interface Cliente {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: string;
    ativo: boolean;
}

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

export interface Painel {
    id: number;
    nome: string;
    descricao: string;
    unidadeAtendimento: UnidadeAtendimento;
    filasVinculadas: Fila[];
    ativo: boolean;
}

export interface ChamadaWebSocket {
    entradaFilaId: number;
    clienteNome: string;
    senha: string;
    filaId: number;
    filaNome: string;
    setorNome: string;
    sala: string;
    horarioChamada: string;
}

export interface DashboardMetricas {
    totalClientes: number;
    clientesAguardando: number;
    clientesAtendimento: number;
    tempoMedioEspera: number;
    tempoMedioAtendimento: number;
    filasAtivas: number;
}