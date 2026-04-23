import { ApiResponse } from '@/types';
import { authService } from './authService';
import BackendConfig from '@/config/BackendConfig';

const API_BASE_URL = BackendConfig.apiBaseUrl;

export interface CepResponseDTO {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
}

export const viaCepService = {
    async buscarPorCep(cep: string): Promise<CepResponseDTO> {
        const cepLimpo = cep.replace(/\D/g, '');
        const res = await fetch(`${API_BASE_URL}/api/cep/${cepLimpo}`, {
            method: 'GET',
            headers: authService.getAuthHeaders(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message || 'CEP não encontrado.');
        }
        const body: ApiResponse<CepResponseDTO> = await res.json();
        return body.data;
    },
};
