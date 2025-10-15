import { useState, useEffect, useCallback, useRef } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Clock, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { websocketService } from '@/services/websocketService';
import { painelService } from '@/services/painelService'; // Importar novo serviço
import { audioService } from '@/services/audioService';
import { PainelPublicoDTO, PainelPublicoConfigDTO } from '@/types';
import { cn } from '@/lib/utils';

interface ChamadaExibicao {
    filaId: string;
    filaNome: string;
    clienteNome: string;
    guicheOuSala: string;
    timestamp: string; // ISO string
    isNew: boolean;
}

const PainelPublico = () => {
    const [painelConfig, setPainelConfig] = useState<PainelPublicoConfigDTO | null>(null);
    const [chamadaAtual, setChamadaAtual] = useState<ChamadaExibicao | null>(null);
    const [ultimasChamadas, setUltimasChamadas] = useState<ChamadaExibicao[]>([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showUnlockOverlay, setShowUnlockOverlay] = useState(false);

    const repeticaoTimers = useRef<number[]>([]);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    // Fila sequencial de anúncios de áudio
    const audioQueue = useRef<Array<() => Promise<void>>>([]);
    const processingAudio = useRef(false);

    const getParam = (k: string): string | null => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get(k);
        } catch {
            return null;
        }
    };

    // Garantir áudio habilitado e preparado logo na montagem
    useEffect(() => {
        // Força o serviço a permanecer habilitado no painel público
        audioService.setEnabled(true);
        setAudioEnabled(true);
        // Tenta aquecer o áudio (pré-carregar e iniciar AudioContext)
        setShowUnlockOverlay(!audioService.isUnlocked());
        audioService.forceEnableAndWarmup()
            .then(() => {
                // Após warmup, reavalia o bloqueio
                setShowUnlockOverlay(!audioService.isUnlocked());
            })
            .catch(() => {});
        // Registra desbloqueio na primeira interação do usuário
        audioService.unlockOnUserGestureOnce();
    }, []);

    // Registrar gesto único para ocultar overlay e tentar liberar áudio
    useEffect(() => {
        if (!audioEnabled || !showUnlockOverlay) return;
        const handler = async () => {
            try { await audioService.tryResume(); } catch {}
            setShowUnlockOverlay(false);
            // removemos listeners após primeira interação
            remove();
        };
        const remove = () => {
            document.removeEventListener('pointerdown', handler, { capture: true } as any);
            document.removeEventListener('touchstart', handler, { capture: true } as any);
            document.removeEventListener('keydown', handler, { capture: true } as any);
        };
        document.addEventListener('pointerdown', handler, { capture: true } as any);
        document.addEventListener('touchstart', handler, { capture: true } as any);
        document.addEventListener('keydown', handler, { capture: true } as any);
        return () => remove();
    }, [audioEnabled, showUnlockOverlay]);

    // Efeito para carregar o painel e conectar ao WebSocket
    useEffect(() => {
        const token = getParam('token');
        const painelId = getParam('painelId');

        console.log('[PainelPublico] Inicializando com:', { painelId, hasToken: !!token });

        if (!painelId) {
            setError('ID do painel não fornecido na URL. Adicione "?painelId=SEU_ID" na URL.');
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError('Token de autenticação não fornecido na URL. Adicione "&token=SEU_TOKEN" na URL.');
            setIsLoading(false);
            return;
        }

        let mounted = true;

        const initializePainel = async () => {
            try {
                console.log('[PainelPublico] Buscando configuração do painel...');

                // 1. Buscar a configuração do painel (endpoint público)
                const configResponse = await painelService.buscarConfiguracaoPublica(painelId, token);

                if (!mounted) return;

                if (!configResponse.success) {
                    throw new Error(configResponse.message || 'Falha ao buscar configuração do painel');
                }

                console.log('[PainelPublico] Configuração carregada:', configResponse.data);
                setPainelConfig(configResponse.data);

                // 2. Conectar ao WebSocket com o token JWT
                console.log('[PainelPublico] Conectando ao WebSocket...');
                websocketService.connect(token);

                // Aguardar um pouco para a conexão estabelecer
                await new Promise(resolve => setTimeout(resolve, 1000));

                const connected = websocketService.isConnected();
                console.log('[PainelPublico] WebSocket conectado:', connected);

                if (!mounted) return;

                setIsConnected(connected);

                // 3. Assinar o tópico do painel
                const topic = `/topic/painel-publico/${painelId}`;
                console.log('[PainelPublico] Inscrevendo no tópico:', topic);

                const unsubscribe = websocketService.subscribe(topic, (payload: any) => {
                    console.log('[PainelPublico] Mensagem recebida:', payload);
                    processPayload(payload as PainelPublicoDTO, configResponse.data!);
                });

                unsubscribeRef.current = unsubscribe;

                if (!mounted) return;

                setIsLoading(false);
                setError(null);

            } catch (err: any) {
                console.error('[PainelPublico] Erro ao inicializar:', err);
                if (mounted) {
                    setError(`Erro ao inicializar o painel: ${err.message}`);
                    setIsLoading(false);
                }
            }
        };

        initializePainel();

        return () => {
            mounted = false;
            console.log('[PainelPublico] Limpando recursos...');
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            websocketService.disconnect();
            repeticaoTimers.current.forEach(clearTimeout);
            repeticaoTimers.current = [];
            // Limpa fila de áudio pendente
            audioQueue.current = [];
            processingAudio.current = false;
        };
    }, []); // Executar apenas uma vez na montagem

    // Efeitos secundários
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        return () => {
            repeticaoTimers.current.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        // Pré-carregar o alerta MP3 para evitar latência na primeira execução
        audioService.preloadAlert().catch(() => {});
    }, []);

    // Processamento de fila de áudio
    const runAudioQueue = useCallback(async () => {
        if (processingAudio.current) return;
        processingAudio.current = true;
        try {
            while (audioQueue.current.length > 0) {
                const task = audioQueue.current.shift();
                if (!task) continue;
                try {
                    await task();
                } catch (e) {
                    console.error('Erro ao executar tarefa de áudio:', e);
                }
            }
        } finally {
            processingAudio.current = false;
        }
    }, []);

    const enqueueAudioTask = useCallback((task: () => Promise<void>) => {
        audioQueue.current.push(task);
        // Dispara o processamento assíncrono da fila
        // Usa microtask para evitar reentrância no mesmo tick
        Promise.resolve().then(() => runAudioQueue());
    }, [runAudioQueue]);

    // Processamento de payload WebSocket
    const processPayload = useCallback((dto: PainelPublicoDTO, config: PainelPublicoConfigDTO) => {
        const filaDaChamada = config.filas.find(f => f.id === dto.filaId);
        if (!filaDaChamada) return;

        // Atualiza a chamada atual
        if (dto.chamadaAtual) {
            const novaChamada: ChamadaExibicao = {
                filaId: dto.filaId,
                filaNome: filaDaChamada.nome,
                clienteNome: dto.chamadaAtual.nomePaciente,
                guicheOuSala: dto.chamadaAtual.guicheOuSala,
                timestamp: dto.chamadaAtual.dataHoraChamada,
                isNew: true,
            };
            setChamadaAtual(novaChamada);

            // Adiciona às últimas chamadas, mantendo o limite
            setUltimasChamadas(prev => [novaChamada, ...prev.filter(c => c.timestamp !== novaChamada.timestamp)].slice(0, 5));

            // Lógica de áudio (agora enfileirada para execução sequencial)
            if (audioEnabled && dto.sinalizacaoSonora) {
                dispararAudio(dto);
            }

            // Remove o destaque após o tempo
            const tempoDestaque = (dto.tempoExibicao ?? 15) * 1000;
            setTimeout(() => {
                setChamadaAtual(prev => prev?.timestamp === novaChamada.timestamp ? { ...prev, isNew: false } : prev);
            }, tempoDestaque);
        } else {
            setChamadaAtual(null); // Limpa se não houver chamada atual
        }
    }, [audioEnabled]);

    const dispararAudio = (dto: PainelPublicoDTO) => {
        // Limpa qualquer timer antigo (não mais utilizado para áudio, mas por segurança)
        repeticaoTimers.current.forEach(clearTimeout);
        repeticaoTimers.current = [];

        const rep = Math.max(1, dto.repeticoes ?? 1);
        const intervalo = Math.max(0, (dto.intervaloRepeticao ?? 5) * 1000);
        const mensagem = (dto.mensagemVocalizacao || '').trim();

        // Enfileira uma única tarefa que executa todas as repetições desta chamada
        const task = async () => {
            // Se o áudio estiver desativado no momento da execução, deixe o serviço decidir (no-op)
            for (let i = 0; i < rep; i++) {
                try {
                    if (i === 0) {
                        await audioService.playAlert('/sounds/alerta.mp3');
                    }
                    if (mensagem) {
                        await audioService.vocalizarTexto(mensagem);
                    } else if (dto.chamadaAtual) {
                        await audioService.vocalizarChamada(dto.chamadaAtual.nomePaciente, dto.chamadaAtual.guicheOuSala, '');
                    }
                    if (i < rep - 1 && intervalo > 0) {
                        await new Promise(res => setTimeout(res, intervalo));
                    }
                } catch (e) {
                    console.error('Erro na reprodução de áudio:', e);
                }
            }
        };

        enqueueAudioTask(task);
    };

    const toggleAudio = async () => {
        // Se já está habilitado, use o clique para apenas desbloquear o áudio (primeiro gesto)
        if (audioEnabled) {
            const wasUnlocked = audioService.isUnlocked();
            const unlockedNow = await audioService.tryResume();
            if (!wasUnlocked && unlockedNow) {
                setShowUnlockOverlay(false);
                // Desbloqueou nesta interação: mantenha habilitado e não alterne o estado
                return;
            }
        }
        setAudioEnabled(prev => {
            const next = !prev;
            audioService.setEnabled(next);
            // Se habilitar novamente e continuar bloqueado, exibe overlay
            if (next && !audioService.isUnlocked()) {
                setShowUnlockOverlay(true);
            } else if (!next) {
                setShowUnlockOverlay(false);
            }
            return next;
        });
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-destructive/5 p-4 text-center">
                <Card className="max-w-lg border-destructive shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-destructive"><AlertTriangle/> Erro na Configuração</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-6 lg:p-8 grid grid-rows-[auto_1fr_auto] gap-4" role="main">
            {/* Overlay de desbloqueio do áudio */}
            {audioEnabled && showUnlockOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90">
                    <div className="text-center">
                        <div className="animate-pulse text-3xl md:text-5xl font-extrabold text-primary drop-shadow">
                            Áudio bloqueado — clique em qualquer lugar para habilitar
                        </div>
                        <div className="mt-4 text-muted-foreground text-sm md:text-base">
                            Dica: após liberar, os anúncios tocarão automaticamente.
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-primary">{painelConfig?.descricao || 'Painel de Chamadas'}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mt-2">
                        <Badge variant={isConnected ? 'default' : 'destructive'} className="text-sm">{isConnected ? 'Online' : 'Desconectado'}</Badge>
                        <div className="hidden md:flex items-center gap-2"><Users className="h-4 w-4" /><span>{painelConfig?.filas.length || 0} fila(s) monitorada(s)</span></div>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleAudio} className="h-10 w-10 md:h-12 md:w-12">
                        {audioEnabled ? <Volume2 className="h-5 w-5 md:h-6 md:w-6 text-success" /> : <VolumeX className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />}
                    </Button>
                    <div className="text-right">
                        <div className="text-2xl md:text-3xl font-mono font-bold">{currentTime.toLocaleTimeString('pt-BR')}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">{currentTime.toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {/* Chamada Atual */}
                <div className={cn("md:col-span-2 rounded-lg flex items-center justify-center p-6 transition-all duration-500", chamadaAtual?.isNew ? 'bg-primary/10 ring-4 ring-primary' : 'bg-card border')}>
                    {chamadaAtual ? (
                        <div className="text-center w-full">
                            <p className="text-lg md:text-2xl text-muted-foreground">Senha</p>
                            {/* Exibir nome completo em vez de apenas o primeiro nome */}
                            <p className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight my-2 md:my-4">{chamadaAtual.clienteNome}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xl md:text-2xl">
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm font-semibold text-muted-foreground">LOCAL</p>
                                    <p className="font-bold">{chamadaAtual.guicheOuSala}</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm font-semibold text-muted-foreground">FILA</p>
                                    <p className="font-bold">{chamadaAtual.filaNome}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Clock className="h-16 w-16 mx-auto mb-4 opacity-50"/>
                            <p className="text-2xl">Aguardando chamada...</p>
                        </div>
                    )}
                </div>

                {/* Últimas Chamadas */}
                <div className="bg-card border rounded-lg p-4 md:p-6 flex flex-col">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">Últimas Chamadas</h2>
                    <div className="space-y-3 flex-1">
                        {ultimasChamadas.slice(1, 6).map((chamada) => (
                            <div key={chamada.timestamp} className="flex items-center justify-between p-3 bg-muted/50 rounded-md text-sm md:text-base">
                                <div className="font-medium truncate">{chamada.clienteNome}</div>
                                <div className="text-muted-foreground whitespace-nowrap">{chamada.guicheOuSala}</div>
                            </div>
                        ))}
                        {ultimasChamadas.length <= 1 && (
                            <div className="text-center text-muted-foreground pt-8">
                                <p>Nenhuma chamada anterior.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-muted-foreground text-xs md:text-sm">
                <p>Em caso de dúvidas, dirija-se à recepção • Sistema Q-Manager</p>
            </footer>
        </div>
    );
};

export default PainelPublico;
