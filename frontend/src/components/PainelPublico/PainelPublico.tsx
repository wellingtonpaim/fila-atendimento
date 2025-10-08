import { useState, useEffect, useCallback, useRef } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Clock, Users, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
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

    const repeticaoTimers = useRef<number[]>([]);

    const getParam = (k: string): string | null => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get(k);
        } catch {
            return null;
        }
    };

    // Efeito para carregar o painel e conectar ao WebSocket
    useEffect(() => {
        const token = getParam('token');
        const painelId = getParam('painelId');

        if (!painelId) {
            setError('ID do painel não fornecido na URL. Adicione "?painelId=SEU_ID".');
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError('Token de autenticação não fornecido na URL. Adicione "?token=SEU_TOKEN".');
            setIsLoading(false);
            return;
        }

        const initializePainel = async () => {
            try {
                // 1. Buscar a configuração do painel
                const configResponse = await painelService.buscarConfiguracaoPublica(painelId);
                if (!configResponse.success) throw new Error(configResponse.message);
                setPainelConfig(configResponse.data);

                // 2. Conectar ao WebSocket
                websocketService.connect(token);
                setIsConnected(websocketService.isConnected());

                // 3. Assinar o tópico do painel
                const topic = `/topic/painel-publico/${painelId}`;
                const unsubscribe = websocketService.subscribe(topic, (payload: any) => {
                    processPayload(payload as PainelPublicoDTO, configResponse.data);
                });

                return () => {
                    unsubscribe();
                    websocketService.disconnect();
                };
            } catch (err: any) {
                setError(`Erro ao inicializar o painel: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        const cleanup = initializePainel();

        return () => {
            if (cleanup && typeof cleanup.then === 'function') {
                cleanup.then(unsub => unsub && unsub());
            }
        };
    }, []);

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

            // Lógica de áudio
            if (audioEnabled && dto.sinalizacaoSonora && dto.mensagemVocalizacao) {
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
        repeticaoTimers.current.forEach(clearTimeout);
        repeticaoTimers.current = [];
        const rep = Math.max(1, dto.repeticoes ?? 1);
        const intervalo = (dto.intervaloRepeticao ?? 5) * 1000;
        for (let i = 0; i < rep; i++) {
            const timerId = window.setTimeout(() => {
                try {
                    audioService.vocalizarChamada(dto.chamadaAtual!.nomePaciente, dto.chamadaAtual!.guicheOuSala, '');
                } catch (e) { console.error('Erro na síntese de voz:', e); }
            }, i * intervalo);
            repeticaoTimers.current.push(timerId);
        }
    };

    const toggleAudio = async () => {
        setAudioEnabled(prev => {
            audioService.setEnabled(!prev);
            return !prev;
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
                            <p className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight my-2 md:my-4">{chamadaAtual.clienteNome.split(' ')[0]}</p>
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