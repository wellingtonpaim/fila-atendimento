class AudioService {
    private static instance: AudioService;
    private synth: SpeechSynthesis;
    private isEnabled: boolean = true;
    private audioCtx: (AudioContext | null) = null;

    private constructor() {
        this.synth = window.speechSynthesis;
        // AudioContext adiado até a primeira reprodução (por políticas do navegador)
        this.audioCtx = null;
    }

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    private async ensureAudioContext(): Promise<AudioContext> {
        if (!this.audioCtx) {
            const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new Ctx();
        }
        if (this.audioCtx.state === 'suspended') {
            try { await this.audioCtx.resume(); } catch {}
        }
        return this.audioCtx;
    }

    private playTone(opts: { freq: number; durationMs: number; type?: OscillatorType; startDelayMs?: number; volume?: number; }): Promise<void> {
        const { freq, durationMs, type = 'sine', startDelayMs = 0, volume = 0.15 } = opts;
        return new Promise(async (resolve) => {
            try {
                const ctx = await this.ensureAudioContext();
                const now = ctx.currentTime + (startDelayMs / 1000);
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, now);

                // Envelope suave (ADSR simples)
                const attack = 0.01; // s
                const decay = 0.08;  // s
                const sustain = 0.7; // porcentagem do pico
                const release = 0.12; // s
                const total = durationMs / 1000;
                const peakTime = now + attack;
                const decayEnd = peakTime + decay;
                const releaseStart = now + Math.max(0.01, total - release);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(volume, peakTime);
                gain.gain.linearRampToValueAtTime(volume * sustain, decayEnd);
                gain.gain.setValueAtTime(volume * sustain, releaseStart);
                gain.gain.linearRampToValueAtTime(0, releaseStart + release);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(releaseStart + release);

                const endAt = (releaseStart + release - ctx.currentTime) * 1000;
                setTimeout(() => resolve(), Math.max(0, endAt));
            } catch {
                resolve();
            }
        });
    }

    /**
     * Reproduz um sinal sonoro curto e agradável (estilo "aeroporto")
     */
    async playChime(): Promise<void> {
        if (!this.isEnabled) return;
        try {
            // Um pequeno "ding-dong" em três notas com leve arpejo
            // Notas (~Hz): A5=880, C#6=1109, E6=1319 (intervalo maior e agradável)
            await this.playTone({ freq: 880, durationMs: 140, type: 'sine', volume: 0.18 });
            await this.playTone({ freq: 1109, durationMs: 150, type: 'sine', volume: 0.16, startDelayMs: 20 });
            await this.playTone({ freq: 1319, durationMs: 140, type: 'sine', volume: 0.14, startDelayMs: 10 });
        } catch (e) {
            // Silencioso: se falhar, apenas segue sem chime
            console.warn('Falha ao tocar chime:', e);
        }
    }

    /**
     * Reproduz um arquivo MP3 (alerta) do diretório público. Útil para tocar apenas na primeira chamada.
     */
    async playAlert(src: string = '/sounds/alerta.mp3'): Promise<void> {
        if (!this.isEnabled) return;
        try {
            // Usar HTMLAudio para evitar latência de decodificação manual
            await this.ensureAudioContext(); // ajuda a contornar políticas de autoplay
            const audio = new Audio(src);
            audio.preload = 'auto';
            return new Promise((resolve) => {
                const cleanup = () => {
                    audio.onended = null;
                    audio.onerror = null;
                    resolve();
                };
                audio.onended = cleanup;
                audio.onerror = (e) => {
                    console.warn('Falha ao reproduzir alerta MP3:', e);
                    cleanup();
                };
                // Pode falhar sem gesto do usuário; se falhar, resolvemos sem bloquear o fluxo
                audio.play().catch((e) => {
                    console.warn('Reprodução MP3 bloqueada pelo navegador:', e);
                    cleanup();
                });
            });
        } catch (e) {
            console.warn('Erro ao iniciar alerta MP3:', e);
        }
    }

    /**
     * Vocaliza um texto arbitrário (respeita as configurações de voz padrão)
     */
    async vocalizarTexto(texto: string): Promise<void> {
        if (!this.isEnabled) return;
        // Cancela qualquer vocalização em andamento
        this.synth.cancel();
        return new Promise((resolve) => {
            try {
                const utterance = new SpeechSynthesisUtterance(texto);
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;

                const voices = this.synth.getVoices();
                const ptBrVoice = voices.find(voice => voice.lang === 'pt-BR' || voice.lang?.toLowerCase().startsWith('pt'));
                if (ptBrVoice) utterance.voice = ptBrVoice;

                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                this.synth.speak(utterance);
            } catch (e) {
                console.error('Erro ao vocalizar texto:', e);
                resolve();
            }
        });
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

        const texto = `${nomeCliente}, favor dirigir-se à ${sala}${setor ? ', ' + setor : ''}`;

        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(texto);

                // Configurações de voz
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;

                // Tentar usar uma voz em português brasileiro se disponível
                const voices = this.synth.getVoices();
                const ptBrVoice = voices.find(voice =>
                    voice.lang === 'pt-BR' ||
                    voice.lang?.toLowerCase().startsWith('pt')
                );

                if (ptBrVoice) {
                    utterance.voice = ptBrVoice;
                }

                utterance.onend = () => {
                    resolve();
                };

                utterance.onerror = (error) => {
                    console.error('Erro na vocalização:', error);
                    resolve(); // não quebrar o fluxo por erro de TTS
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
        } else {
            // Tentar resumir o AudioContext em caso de bloqueio por política de autoplay
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume().catch(() => {});
            }
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
            await this.playChime();
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