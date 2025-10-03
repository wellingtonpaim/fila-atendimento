import { 
    ApiResponse, 
    TempoEsperaDTO, 
    ProdutividadeDTO, 
    HorarioPicoDTO, 
    FluxoPacientesDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8899';

class DashboardService {
    private static instance: DashboardService;

    private constructor() {}

    public static getInstance(): DashboardService {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }

    /**
     * Headers padrão para requisições autenticadas
     */
    private getAuthHeaders(): Record<string, string> {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Busca tempo médio de espera por unidade e período
     */
    async tempoMedioEspera(
        unidadeId: string, 
        inicio: string, 
        fim: string
    ): Promise<TempoEsperaDTO[]> {
        try {
            console.log('🚀 Buscando tempo médio de espera...');

            const params = new URLSearchParams({
                unidadeId,
                inicio,
                fim
            });

            const response = await fetch(`${API_BASE_URL}/api/dashboard/tempo-medio-espera?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<TempoEsperaDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar tempo médio de espera');
            }

            console.log('✅ Dados de tempo médio carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar tempo médio de espera:', error);
            throw error;
        }
    }

    /**
     * Busca dados de produtividade por unidade e período
     */
    async produtividade(
        unidadeId: string, 
        inicio: string, 
        fim: string
    ): Promise<ProdutividadeDTO[]> {
        try {
            console.log('🚀 Buscando dados de produtividade...');

            const params = new URLSearchParams({
                unidadeId,
                inicio,
                fim
            });

            const response = await fetch(`${API_BASE_URL}/api/dashboard/produtividade?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<ProdutividadeDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar dados de produtividade');
            }

            console.log('✅ Dados de produtividade carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar dados de produtividade:', error);
            throw error;
        }
    }

    /**
     * Busca horários de pico por unidade e período
     */
    async horariosPico(
        unidadeId: string, 
        inicio: string, 
        fim: string
    ): Promise<HorarioPicoDTO[]> {
        try {
            console.log('🚀 Buscando horários de pico...');

            const params = new URLSearchParams({
                unidadeId,
                inicio,
                fim
            });

            const response = await fetch(`${API_BASE_URL}/api/dashboard/horarios-pico?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<HorarioPicoDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar horários de pico');
            }

            console.log('✅ Dados de horários de pico carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar horários de pico:', error);
            throw error;
        }
    }

    /**
     * Busca fluxo de pacientes por unidade e período
     */
    async fluxoPacientes(
        unidadeId: string, 
        inicio: string, 
        fim: string
    ): Promise<FluxoPacientesDTO[]> {
        try {
            console.log('🚀 Buscando fluxo de pacientes...');

            const params = new URLSearchParams({
                unidadeId,
                inicio,
                fim
            });

            const response = await fetch(`${API_BASE_URL}/api/dashboard/fluxo-pacientes?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const result: ApiResponse<FluxoPacientesDTO[]> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao buscar fluxo de pacientes');
            }

            console.log('✅ Dados de fluxo de pacientes carregados:', result.data.length);
            return result.data;
        } catch (error) {
            console.error('❌ Erro ao buscar fluxo de pacientes:', error);
            throw error;
        }
    }

    /**
     * Busca dados completos do dashboard para um período
     */
    async getDashboardCompleto(unidadeId: string, inicio: string, fim: string) {
        try {
            console.log('🚀 Carregando dashboard completo...');

            const [tempoEspera, produtividade, horariosPico, fluxoPacientes] = await Promise.all([
                this.tempoMedioEspera(unidadeId, inicio, fim),
                this.produtividade(unidadeId, inicio, fim),
                this.horariosPico(unidadeId, inicio, fim),
                this.fluxoPacientes(unidadeId, inicio, fim)
            ]);

            console.log('✅ Dashboard completo carregado');

            return {
                tempoEspera,
                produtividade,
                horariosPico,
                fluxoPacientes
            };
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard completo:', error);
            throw error;
        }
    }
}

// Exportar instância singleton
export const dashboardService = DashboardService.getInstance();
