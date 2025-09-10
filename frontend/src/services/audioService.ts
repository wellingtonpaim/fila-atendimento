class AudioService {
    private static instance: AudioService;
    private synth: SpeechSynthesis;
    private isEnabled: boolean = true;

    private constructor() {
        this.synth = window.speechSynthesis;
    }

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    /**
     * Vocaliza o nome do paciente e a sala de atendimento
     */
    async vocalizarChamada(nomeCliente: string, sala: string, setor: string): Promise<void> {
        if (!this.isEnabled) {
            console.log('Áudio desabilitado');
            return;
        }

        // Cancela qualquer vocalização em andamento
        this.synth.cancel();

        const texto = `${nomeCliente}, favor dirigir-se à ${sala}, ${setor}`;

        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(texto);

                // Configurações de voz
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 0.8;

                // Tentar usar uma voz em português brasileiro se disponível
                const voices = this.synth.getVoices();
                const ptBrVoice = voices.find(voice =>
                    voice.lang === 'pt-BR' ||
                    voice.lang.startsWith('pt')
                );

                if (ptBrVoice) {
                    utterance.voice = ptBrVoice;
                }

                utterance.onend = () => {
                    console.log('Vocalização concluída:', texto);
                    resolve();
                };

                utterance.onerror = (error) => {
                    console.error('Erro na vocalização:', error);
                    reject(error);
                };

                this.synth.speak(utterance);
            } catch (error) {
                console.error('Erro ao criar vocalização:', error);
                reject(error);
            }
        });
    }

    /**
     * Para qualquer vocalização em andamento
     */
    pararVocalizacao(): void {
        this.synth.cancel();
    }

    /**
     * Habilita ou desabilita o áudio
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (!enabled) {
            this.pararVocalizacao();
        }
    }

    /**
     * Verifica se o áudio está habilitado
     */
    isAudioEnabled(): boolean {
        return this.isEnabled;
    }

    /**
     * Testa o sistema de áudio
     */
    async testarAudio(): Promise<void> {
        try {
            await this.vocalizarChamada('João da Silva', 'Sala 1', 'Consultório Médico');
        } catch (error) {
            console.error('Teste de áudio falhou:', error);
            throw error;
        }
    }

    /**
     * Lista vozes disponíveis
     */
    getVozesDisponiveis(): SpeechSynthesisVoice[] {
        return this.synth.getVoices();
    }
}

export const audioService = AudioService.getInstance();