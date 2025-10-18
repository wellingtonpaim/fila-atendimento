import {
    ApiResponse,
    PainelResponseDTO,
    PainelCreateDTO,
    PainelUpdateDTO,
    PainelPublicoConfigDTO,
    FilaResponseDTO
} from '@/types';
import { authService } from './authService';
import BackendConfig from '@/config/BackendConfig';
const API_BASE_URL = BackendConfig.apiBaseUrl;
class PainelService {

    /**
     * Lista painéis por unidade
     */
    async listarPorUnidade(unidadeId: string): Promise<ApiResponse<PainelResponseDTO[]>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/unidade/${unidadeId}`, {
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao buscar painéis por unidade');
        return response.json();
    }

    /**
     * Lista painéis por unidade com paginação
     */
    async listarPorUnidadePaginado(unidadeId: string, page: number, size: number): Promise<ApiResponse<PainelResponseDTO[]>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/unidade/${unidadeId}?page=${page}&size=${size}`, {
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao buscar painéis por unidade');
        return response.json();
    }

    /**
     * Busca painel por ID (requer unidadeAtendimentoId)
     */
    async buscarPorId(id: string, unidadeAtendimentoId: string): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${id}?unidadeAtendimentoId=${encodeURIComponent(unidadeAtendimentoId)}`, {
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao buscar painel');
        return response.json();
    }

    /**
     * Busca a configuração pública de um painel. O backend retorna PainelResponseDTO (com filasIds),
     * então aqui enriquecemos para PainelPublicoConfigDTO (com filas detalhadas).
     * Estratégia: tentar sem Authorization; se 401 e houver JWT, tentar novamente com Authorization.
     */
    async buscarConfiguracaoPublica(id: string, jwt?: string): Promise<ApiResponse<PainelPublicoConfigDTO>> {
        const url = `${API_BASE_URL}/api/paineis/publico/${id}`;

        const doFetch = (withAuth: boolean) => fetch(url, {
            method: 'GET',
            headers: withAuth && jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
        });

        let resp = await doFetch(false);
        if (resp.status === 401 && jwt) {
            // Backend ainda exige Authorization: tentar novamente
            resp = await doFetch(true);
        }

        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('Erro ao buscar painel público:', errorText);
            throw new Error(`Erro ${resp.status}: ${errorText || 'Falha ao buscar painel público'}`);
        }

        const body: ApiResponse<PainelResponseDTO> = await resp.json();
        const painel = body?.data;
        if (!painel) {
            throw new Error('Resposta inválida do servidor ao buscar painel público.');
        }

        const filaHeaders: Record<string, string> = {};
        if (jwt) filaHeaders['Authorization'] = `Bearer ${jwt}`;

        const filas: FilaResponseDTO[] = [];
        for (const filaId of painel.filasIds || []) {
            try {
                const fResp = await fetch(`${API_BASE_URL}/api/filas/${filaId}`, {
                    method: 'GET',
                    headers: filaHeaders,
                });
                if (!fResp.ok) {
                    const t = await fResp.text();
                    console.warn(`Falha ao buscar fila ${filaId}: ${fResp.status} ${t}`);
                    continue;
                }
                const fBody: ApiResponse<FilaResponseDTO> = await fResp.json();
                if (fBody?.data) filas.push(fBody.data);
            } catch (e) {
                console.warn(`Erro ao buscar fila ${filaId}:`, e);
            }
        }

        const cfg: PainelPublicoConfigDTO = {
            id: painel.id,
            descricao: painel.descricao,
            filas,
        };

        return {
            success: body.success,
            message: body.message || 'Configuração do painel carregada',
            data: cfg,
            errors: body.errors,
            timestamp: body.timestamp,
        };
    }

    /**
     * Cria novo painel
     */
    async criar(painel: PainelCreateDTO): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis`, {
            method: 'POST',
            headers: authService.getAuthHeaders(),
            body: JSON.stringify(painel),
        });
        if (!response.ok) throw new Error('Falha ao criar painel');
        return response.json();
    }

    /**
     * Atualiza painel (PUT)
     */
    async atualizar(id: string, painel: PainelUpdateDTO): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${id}`, {
            method: 'PUT',
            headers: authService.getAuthHeaders(),
            body: JSON.stringify(painel),
        });
        if (!response.ok) throw new Error('Falha ao atualizar painel');
        return response.json();
    }

    /**
     * Desativa painel
     */
    async desativar(id: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${id}`, {
            method: 'DELETE',
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao desativar painel');
        return response.json();
    }

    /**
     * Adiciona uma fila a um painel
     */
    async adicionarFila(painelId: string, filaId: string): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${painelId}/filas/${filaId}`, {
            method: 'POST',
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao adicionar fila ao painel');
        return response.json();
    }

    /**
     * Remove uma fila de um painel
     */
    async removerFila(painelId: string, filaId: string): Promise<ApiResponse<PainelResponseDTO>> {
        const response = await fetch(`${API_BASE_URL}/api/paineis/${painelId}/filas/${filaId}`, {
            method: 'DELETE',
            headers: authService.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao remover fila do painel');
        return response.json();
    }
}

// Exportar instância singleton
export const painelService = new PainelService();