class AudioService {
    private static instance: AudioService;
    private synth: SpeechSynthesis;
    private isEnabled: boolean = true;
    private audioCtx: (AudioContext | null) = null;
    private volume: number = 0.9; // 0..1
    private alertSrc: string = '/sounds/alerta.mp3';
    private alertAudio: HTMLAudioElement | null = null;

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

    // Inicializa a partir do localStorage
    initFromStorage(): void {
        try {
            const raw = localStorage.getItem('qmanager_config');
            if (raw) {
                const cfg = JSON.parse(raw);
                if (typeof cfg.audioHabilitado === 'boolean') this.isEnabled = !!cfg.audioHabilitado;
                const volPct = Number(cfg.volumeAudio);
                if (!Number.isNaN(volPct)) this.volume = Math.max(0, Math.min(1, (volPct ?? 50) / 100));
                const som = cfg.somChamada;
                if (typeof som === 'string' && som) {
                    this.setAlertSrc(this.mapSomToSrc(som));
                }
            }
        } catch {}
    }

    // ===== Configuração global =====
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (!enabled) {
            this.pararVocalizacao();
        } else {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume().catch(() => {});
            }
        }
    }
    isAudioEnabled(): boolean {
        return this.isEnabled;
    }
    setVolume(v: number): void {
        // clamp [0,1]
        this.volume = Math.max(0, Math.min(1, v));
    }
    getVolume(): number {
        return this.volume;
    }
    setAlertSrc(src: string): void {
        this.alertSrc = src || '/sounds/alerta.mp3';
        // se já existir áudio pre-carregado de outra fonte, descartamos; irá ser recarregado sob demanda
        this.alertAudio = null;
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
        const vol = Math.max(0, Math.min(1, volume * this.volume));
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
                gain.gain.linearRampToValueAtTime(vol, peakTime);
                gain.gain.linearRampToValueAtTime(vol * sustain, decayEnd);
                gain.gain.setValueAtTime(vol * sustain, releaseStart);
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

    /** Pré-carregar alerta MP3 para reduzir latência na primeira reprodução */
    async preloadAlert(src?: string): Promise<void> {
        const path = src || this.alertSrc;
        try {
            this.alertAudio = new Audio(path);
            this.alertAudio.preload = 'auto';
            this.alertAudio.volume = this.volume;
            await new Promise<void>((resolve) => {
                const done = () => {
                    if (this.alertAudio) {
                        this.alertAudio.oncanplaythrough = null;
                        this.alertAudio.onerror = null;
                    }
                    resolve();
                };
                if (!this.alertAudio) return resolve();
                this.alertAudio.oncanplaythrough = done;
                this.alertAudio.onerror = () => done();
                // Kick loading
                // NOTE: some browsers require play() to decode, we avoid auto-play to respect policies.
            });
        } catch {}
    }

    /**
     * Reproduz um sinal sonoro curto e agradável (estilo "aeroporto")
     */
    async playChime(): Promise<void> {
        if (!this.isEnabled) return;
        try {
            await this.playTone({ freq: 880, durationMs: 140, type: 'sine', volume: 0.18 });
            await this.playTone({ freq: 1109, durationMs: 150, type: 'sine', volume: 0.16, startDelayMs: 20 });
            await this.playTone({ freq: 1319, durationMs: 140, type: 'sine', volume: 0.14, startDelayMs: 10 });
        } catch (e) {
            console.warn('Falha ao tocar chime:', e);
        }
    }

    /**
     * Reproduz um arquivo MP3 de alerta. Usa cache se pré-carregado.
     */
    async playAlert(src?: string): Promise<void> {
        if (!this.isEnabled) return;
        const path = src || this.alertSrc;
        try {
            await this.ensureAudioContext();
            const elem = this.alertAudio && this.alertSrc === path ? this.alertAudio : new Audio(path);
            elem.preload = 'auto';
            elem.volume = this.volume;
            return new Promise((resolve) => {
                const cleanup = () => {
                    elem.onended = null;
                    elem.onerror = null;
                    resolve();
                };
                try { elem.currentTime = 0; } catch {}
                elem.onended = cleanup;
                elem.onerror = () => cleanup();
                elem.play().catch(() => cleanup());
            });
        } catch (e) {
            console.warn('Erro ao iniciar alerta MP3:', e);
        }
    }

    /** Vocaliza um texto arbitrário */
    async vocalizarTexto(texto: string): Promise<void> {
        if (!this.isEnabled) return;
        this.synth.cancel();
        return new Promise((resolve) => {
            try {
                const utterance = new SpeechSynthesisUtterance(texto);
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = this.volume;
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

    /** Vocaliza o nome do paciente e a sala de atendimento */
    async vocalizarChamada(nomeCliente: string, sala: string, setor: string): Promise<void> {
        if (!this.isEnabled) {
            return;
        }
        this.synth.cancel();
        const texto = `${nomeCliente}, favor dirigir-se à ${sala}${setor ? ', ' + setor : ''}`;
        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(texto);
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = this.volume;
                const voices = this.synth.getVoices();
                const ptBrVoice = voices.find(voice =>
                    voice.lang === 'pt-BR' ||
                    voice.lang?.toLowerCase().startsWith('pt')
                );
                if (ptBrVoice) {
                    utterance.voice = ptBrVoice;
                }
                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                this.synth.speak(utterance);
            } catch (error) {
                console.error('Erro ao criar vocalização:', error);
                reject(error);
            }
        });
    }

    pararVocalizacao(): void {
        this.synth.cancel();
    }

    async testarAudio(): Promise<void> {
        try {
            await this.preloadAlert();
            await this.playAlert();
            await this.vocalizarChamada('João da Silva', 'Guichê 3', '');
        } catch (error) {
            console.error('Teste de áudio falhou:', error);
            throw error;
        }
    }

    getVozesDisponiveis(): SpeechSynthesisVoice[] {
        return this.synth.getVoices();
    }

    private mapSomToSrc(valor: string): string {
        switch (valor) {
            case 'padrao':
            case 'campainha':
            case 'sino':
            case 'beep':
            default:
                return '/sounds/alerta.mp3';
        }
    }
}

export const audioService = AudioService.getInstance();