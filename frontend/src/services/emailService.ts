import { 
    ApiResponse, 
    EmailRequestDTO 
} from '@/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

class EmailService {
    private static instance: EmailService;

    private constructor() {}

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
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
     * Envia email
     */
    async enviarEmail(emailData: EmailRequestDTO): Promise<void> {
        try {
            console.log('🚀 Enviando email para:', emailData.to);

            const response = await fetch(`${API_BASE_URL}/api/email/send`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const result: ApiResponse<void> = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao enviar email');
            }

            console.log('✅ Email enviado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao enviar email:', error);
            throw error;
        }
    }

    /**
     * Envia email de notificação de chamada
     */
    async enviarNotificacaoChamada(
        destinatario: string,
        nomeCliente: string,
        senha: string,
        setor: string,
        guiche: string
    ): Promise<void> {
        const emailData: EmailRequestDTO = {
            to: destinatario,
            from: 'noreply@qmanager.com',
            subject: `Q-Manager - Sua vez chegou!`,
            body: `
                <h2>Sua chamada está pronta!</h2>
                <p>Olá <strong>${nomeCliente}</strong>,</p>
                <p>Sua senha <strong>${senha}</strong> foi chamada!</p>
                <p><strong>Setor:</strong> ${setor}</p>
                <p><strong>Guichê/Sala:</strong> ${guiche}</p>
                <p>Por favor, dirija-se ao local indicado.</p>
                <hr>
                <p><small>Este é um email automático do sistema Q-Manager.</small></p>
            `
        };

        return this.enviarEmail(emailData);
    }

    /**
     * Envia email de confirmação de agendamento
     */
    async enviarConfirmacaoAgendamento(
        destinatario: string,
        nomeCliente: string,
        dataHora: string,
        setor: string,
        observacoes?: string
    ): Promise<void> {
        const emailData: EmailRequestDTO = {
            to: destinatario,
            from: 'noreply@qmanager.com',
            subject: `Q-Manager - Confirmação de Agendamento`,
            body: `
                <h2>Agendamento Confirmado</h2>
                <p>Olá <strong>${nomeCliente}</strong>,</p>
                <p>Seu agendamento foi confirmado com sucesso!</p>
                <p><strong>Data e Hora:</strong> ${dataHora}</p>
                <p><strong>Setor:</strong> ${setor}</p>
                ${observacoes ? `<p><strong>Observações:</strong> ${observacoes}</p>` : ''}
                <p>Chegue com 15 minutos de antecedência.</p>
                <hr>
                <p><small>Este é um email automático do sistema Q-Manager.</small></p>
            `
        };

        return this.enviarEmail(emailData);
    }
}

// Exportar instância singleton
export const emailService = EmailService.getInstance();
