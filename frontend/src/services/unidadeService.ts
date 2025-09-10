import { ApiResponse, UnidadeAtendimentoLogin } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

let cacheUnidades: UnidadeAtendimentoLogin[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export class UnidadeService {
    /**
     * Busca as unidades de atendimento disponíveis para login.
     * O endpoint pode retornar diretamente uma lista ou embrulhado em ApiResponse.
     * Implementa cache simples em memória para reduzir chamadas redundantes.
     */
    static async getUnidadesParaLogin(force = false): Promise<UnidadeAtendimentoLogin[]> {
        try {
            // Cache válido
            if (!force && cacheUnidades && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_TTL_MS) {
                console.log('♻️ Retornando unidades do cache');
                return cacheUnidades;
            }

            const url = `${API_BASE_URL}/api/unidades-atendimento/public/login`;
            console.log('🌐 Buscando unidades em:', url);
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }

            const raw = await response.json();
            let unidades: UnidadeAtendimentoLogin[] | null = null;

            if (Array.isArray(raw)) {
                unidades = raw as UnidadeAtendimentoLogin[];
            } else if (raw && typeof raw === 'object' && 'data' in raw) {
                const apiResp = raw as ApiResponse<UnidadeAtendimentoLogin[]>;
                if (apiResp.success === false) {
                    throw new Error(apiResp.message || 'Falha ao obter unidades');
                }
                if (Array.isArray(apiResp.data)) {
                    unidades = apiResp.data;
                }
            }

            if (!unidades) {
                throw new Error('Formato de resposta inesperado do endpoint de unidades');
            }

            // Normaliza itens garantindo id e nome
            unidades = unidades.filter(u => u && typeof u.id === 'string' && typeof u.nome === 'string');

            cacheUnidades = unidades;
            cacheTimestamp = Date.now();
            console.log(`✅ ${unidades.length} unidades carregadas`);
            return unidades;
        } catch (error) {
            console.error('❌ Erro ao carregar unidades de atendimento:', error);
            throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar unidades');
        }
    }

    static clearCache() {
        cacheUnidades = null;
        cacheTimestamp = null;
    }
}

export const unidadeService = UnidadeService;
