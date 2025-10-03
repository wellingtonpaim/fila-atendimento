import { 
    ApiResponse, 
    EntradaFilaResponseDTO, 
    EntradaFilaCreateDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

class EntradaFilaService {
    /**
     * Adiciona cliente à fila
     */
    async adicionarClienteAFila(entrada: EntradaFilaCreateDTO): Promise<EntradaFilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrada-fila`, {
                method: 'POST',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(entrada)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao adicionar cliente à fila');
            }

            const result: ApiResponse<EntradaFilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao adicionar cliente à fila');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao adicionar cliente à fila:', error);
            throw new Error(error.message || 'Erro ao adicionar cliente à fila');
        }
    }

    /**
     * Chama próximo cliente da fila
     */
    async chamarProximo(filaId: string, usuarioId: string, guiche: string): Promise<EntradaFilaResponseDTO> {
        try {
            const params = new URLSearchParams({
                filaId,
                usuarioId,
                guiche
            });

            const response = await fetch(`${API_BASE_URL}/api/entrada-fila/chamar-proximo?${params}`, {
                method: 'POST',
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao chamar próximo cliente');
            }

            const result: ApiResponse<EntradaFilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao chamar próximo cliente');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao chamar próximo cliente:', error);
            throw new Error(error.message || 'Erro ao chamar próximo cliente');
        }
    }

    /**
     * Finaliza atendimento
     */
    async finalizarAtendimento(entradaFilaId: string): Promise<EntradaFilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrada-fila/finalizar/${entradaFilaId}`, {
                method: 'POST',
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao finalizar atendimento');
            }

            const result: ApiResponse<EntradaFilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao finalizar atendimento');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao finalizar atendimento:', error);
            throw new Error(error.message || 'Erro ao finalizar atendimento');
        }
    }

    /**
     * Cancela atendimento
     */
    async cancelarAtendimento(entradaFilaId: string): Promise<EntradaFilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrada-fila/cancelar/${entradaFilaId}`, {
                method: 'POST',
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao cancelar atendimento');
            }

            const result: ApiResponse<EntradaFilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao cancelar atendimento');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao cancelar atendimento:', error);
            throw new Error(error.message || 'Erro ao cancelar atendimento');
        }
    }

    /**
     * Encaminha cliente para outra fila
     */
    async encaminharParaFila(entradaFilaIdOrigem: string, novaEntrada: EntradaFilaCreateDTO): Promise<EntradaFilaResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrada-fila/encaminhar/${entradaFilaIdOrigem}`, {
                method: 'POST',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(novaEntrada)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao encaminhar cliente');
            }

            const result: ApiResponse<EntradaFilaResponseDTO> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao encaminhar cliente');
            }

            return result.data;
        } catch (error: any) {
            console.error('❌ Erro ao encaminhar cliente:', error);
            throw new Error(error.message || 'Erro ao encaminhar cliente');
        }
    }

    /**
     * Lista clientes aguardando em uma fila
     */
    async listarAguardandoPorFila(filaId: string): Promise<EntradaFilaResponseDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrada-fila/aguardando/${filaId}`, {
                headers: authService.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao buscar clientes aguardando');
            }

            const result: ApiResponse<EntradaFilaResponseDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar clientes aguardando');
            }

            return result.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar clientes aguardando:', error);
            throw new Error(error.message || 'Erro ao buscar clientes aguardando');
        }
    }
}

export const entradaFilaService = new EntradaFilaService();
