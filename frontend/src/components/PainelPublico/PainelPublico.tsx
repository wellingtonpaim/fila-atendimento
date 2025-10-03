import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Volume2,
    VolumeX,
    Clock,
    Users,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { websocketService } from '@/services/websocketService';
import { audioService } from '@/services/audioService';
import { ChamadaWebSocket, PainelPublicoDTO, PainelPublicoChamadaDTO } from '@/types';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';

interface ChamadaAtual extends ChamadaWebSocket {
    timestampLocal: number;
    isNew: boolean;
}

// Map para deduplicação (chave = dataHoraChamada ou timestamp original)
const chaveChamada = (c: ChamadaAtual) => `${c.timestamp}`;

interface FilaPainelState {
  filaId: string;
  chamadas: ChamadaAtual[]; // ordenadas desc por timestamp
}

const PainelPublico = () => {
    const [chamadas, setChamadas] = useState<ChamadaAtual[]>([]); // manter legado (única fila)
    const [filasPainel, setFilasPainel] = useState<Record<string, FilaPainelState>>({});
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isConnected, setIsConnected] = useState(false);
    const [semToken, setSemToken] = useState(false);
    const [filaId, setFilaId] = useState<string | null>(null);
    const repeticaoTimers = useRef<number[]>([]);

    // ===== Utilidades Query =====
    const getParam = (k: string): string | null => {
        try { const p = new URLSearchParams(window.location.search); const v = p.get(k); return v && v.trim() ? v.trim() : null; } catch { return null; }
    };

    const getTokenFromQuery = (): string | null => getParam('token');
    const getFilaFromQuery = (): string | null => getParam('fila') || getParam('filaId') || (() => {
        // compat: permitir listas antigas ?filas=a,b  -> pega primeira
        try {
            const filas = getParam('filas');
            if (!filas) return null;
            return filas.split(',').map(s => s.trim()).filter(Boolean)[0] || null;
        } catch { return null; }
    })();
    const getFilasFromQuery = (): string[] => {
        const multi = getParam('filas');
        if (multi) return multi.split(',').map(s => s.trim()).filter(Boolean);
        const single = getParam('fila') || getParam('filaId');
        return single ? [single] : [];
    };

    // Relógio
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Limpeza timers de repetição ao desmontar
    useEffect(() => {
        return () => {
            repeticaoTimers.current.forEach(id => clearTimeout(id));
            repeticaoTimers.current = [];
        };
    }, []);

    // ====== Conexão WebSocket ======
    useEffect(() => {
        const jwt = getTokenFromQuery() || authService.getToken();
        const listaFilas = getFilasFromQuery();
        setFilaId(listaFilas[0] || null); // compat com lógica existente
        if (!jwt) {
            console.warn('[PainelPublico] JWT ausente. Forneça ?token=... na URL ou faça login.');
            setSemToken(true);
            setIsConnected(false);
            return;
        }
        if (listaFilas.length === 0) {
            console.warn('[PainelPublico] Nenhuma fila informada. Use ?filas=ID1,ID2 ou ?fila=ID');
        }

        websocketService.connect(jwt);
        setIsConnected(websocketService.isConnected());

        const unsubscribers: Array<() => void> = [];
        listaFilas.forEach(fila => {
            const dest = `/topic/painel/${fila}`;
            const unsub = websocketService.subscribe(dest, (payload: any) => {
                processPayloadMulti(fila, payload);
            });
            unsubscribers.push(unsub);
        });

        return () => {
            unsubscribers.forEach(u => u());
            websocketService.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ====== Processamento de Payload (multi-fila) ======
    const processPayloadMulti = useCallback((filaId: string, payload: any) => {
        if (payload && (payload.chamadaAtual !== undefined || payload.ultimasChamadas)) {
            handlePainelPublicoDTOMulti(filaId, payload as PainelPublicoDTO);
            return;
        }
        handleChamadaUnicaMulti(filaId, payload as ChamadaWebSocket);
    }, [audioEnabled]);

    const toChamadaAtual = (c: PainelPublicoChamadaDTO, fila: string): ChamadaAtual => ({
        entradaFilaId: c.dataHoraChamada, // não temos ID -> usar timestamp ISO como chave
        clienteNome: c.nomePaciente,
        senha: '-',
        filaId: fila,
        filaNome: '',
        setorNome: 'Atendimento',
        guicheOuSalaAtendimento: c.guicheOuSala,
        timestamp: c.dataHoraChamada,
        timestampLocal: Date.now(),
        isNew: true
    });

    const handlePainelPublicoDTO = (dto: PainelPublicoDTO) => {
        setChamadas(prev => {
            const mapa = new Map(prev.map(c => [chaveChamada(c), c]));
            const novos: ChamadaAtual[] = [];

            if (dto.chamadaAtual) {
                const ch = toChamadaAtual(dto.chamadaAtual, dto.filaId);
                mapa.set(chaveChamada(ch), ch);
                novos.push(ch);
            }
            dto.ultimasChamadas?.forEach(c => {
                const ch = toChamadaAtual(c, dto.filaId);
                if (!mapa.has(chaveChamada(ch))) {
                    mapa.set(chaveChamada(ch), { ...ch, isNew: false });
                }
            });

            // Ordenar por timestamp (desc)
            const ordenado = Array.from(mapa.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const limitado = ordenado.slice(0, 10);

            // Marcar apenas a chamadaAtual como isNew (se houver)
            if (dto.chamadaAtual) {
                const chaveAtual = dto.chamadaAtual.dataHoraChamada;
                for (const c of limitado) {
                    c.isNew = c.timestamp === chaveAtual;
                }
                // Remover destaque após tempoExibicao
                const tempo = (dto.tempoExibicao ?? 15) * 1000;
                setTimeout(() => {
                    setChamadas(cs => cs.map(c => c.timestamp === chaveAtual ? { ...c, isNew: false } : c));
                }, tempo);
            }

            // Áudio (repetições) se habilitado
            if (audioEnabled && dto.sinalizacaoSonora && dto.mensagemVocalizacao) {
                dispararAudio(dto);
            }

            return limitado;
        });
    };

    const handlePainelPublicoDTOMulti = (fid: string, dto: PainelPublicoDTO) => {
        setFilasPainel(prev => {
            const clone = { ...prev };
            const existente = clone[fid] || { filaId: fid, chamadas: [] };
            const mapa = new Map(existente.chamadas.map(c => [chaveChamada(c), c]));

            if (dto.chamadaAtual) {
                const ch = toChamadaAtual(dto.chamadaAtual, fid);
                mapa.set(chaveChamada(ch), ch);
            }
            dto.ultimasChamadas?.forEach(c => {
                const ch = toChamadaAtual(c, fid);
                if (!mapa.has(chaveChamada(ch))) mapa.set(chaveChamada(ch), { ...ch, isNew: false });
            });

            let lista = Array.from(mapa.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            lista = lista.slice(0, 10);

            if (dto.chamadaAtual) {
                const chaveAtual = dto.chamadaAtual.dataHoraChamada;
                lista = lista.map(c => ({ ...c, isNew: c.timestamp === chaveAtual }));
                const tempo = (dto.tempoExibicao ?? 15) * 1000;
                setTimeout(() => {
                    setFilasPainel(p => {
                        const cp = { ...p };
                        const f = cp[fid];
                        if (!f) return p;
                        f.chamadas = f.chamadas.map(c => c.timestamp === chaveAtual ? { ...c, isNew: false } : c);
                        return cp;
                    });
                }, tempo);
            }

            existente.chamadas = lista;
            clone[fid] = existente;

            if (audioEnabled && dto.sinalizacaoSonora && dto.mensagemVocalizacao) {
                dispararAudio(dto);
            }

            return clone;
        });
    };

    const dispararAudio = (dto: PainelPublicoDTO) => {
        // Limpar timers anteriores
        repeticaoTimers.current.forEach(id => clearTimeout(id));
        repeticaoTimers.current = [];

        const rep = Math.max(1, dto.repeticoes ?? 1);
        const intervalo = Math.max(1, dto.intervaloRepeticao ?? 5);
        for (let i = 0; i < rep; i++) {
            const delay = i * intervalo * 1000;
            const t = window.setTimeout(() => {
                try {
                    const texto = dto.mensagemVocalizacao!;
                    // Usar API nativa diretamente para flexibilidade (não conflitar com vocalizarChamada pré-existente)
                    window.speechSynthesis.cancel();
                    const utter = new SpeechSynthesisUtterance(texto);
                    utter.lang = 'pt-BR';
                    utter.rate = 0.95;
                    utter.pitch = 1;
                    window.speechSynthesis.speak(utter);
                } catch (e) {
                    console.error('Erro síntese:', e);
                }
            }, delay);
            repeticaoTimers.current.push(t);
        }
    };

    const handleChamadaUnica = useCallback(async (novaChamada: ChamadaWebSocket) => {
        const chamadaComTimestamp: ChamadaAtual = {
            ...novaChamada,
            timestampLocal: Date.now(),
            isNew: true,
        };

        setChamadas(prev => {
            const existentes = prev.filter(c => c.entradaFilaId !== chamadaComTimestamp.entradaFilaId);
            const novas = [chamadaComTimestamp, ...existentes].slice(0, 10);
            return novas.map((c, idx) => ({ ...c, isNew: idx === 0 }));
        });

        if (audioEnabled) {
            try {
                await audioService.vocalizarChamada(
                    novaChamada.clienteNome,
                    novaChamada.guicheOuSalaAtendimento,
                    novaChamada.setorNome
                );
            } catch (error) {
                console.error('Erro na vocalização:', error);
            }
        }

        setTimeout(() => {
            setChamadas(prev => prev.map(c => (
                c.entradaFilaId === chamadaComTimestamp.entradaFilaId ? { ...c, isNew: false } : c
            )));
        }, 5000);
    }, [audioEnabled]);

    const handleChamadaUnicaMulti = useCallback(async (fid: string, novaChamada: ChamadaWebSocket) => {
        const chamadaComTimestamp: ChamadaAtual = {
            ...novaChamada,
            timestampLocal: Date.now(),
            isNew: true,
        };
        setFilasPainel(prev => {
            const clone = { ...prev };
            const existente = clone[fid] || { filaId: fid, chamadas: [] };
            const filtradas = existente.chamadas.filter(c => c.entradaFilaId !== chamadaComTimestamp.entradaFilaId);
            existente.chamadas = [chamadaComTimestamp, ...filtradas].slice(0, 10).map((c, idx) => ({ ...c, isNew: idx === 0 }));
            clone[fid] = existente;
            return clone;
        });
        if (audioEnabled) {
            try {
                await audioService.vocalizarChamada(novaChamada.clienteNome, novaChamada.guicheOuSalaAtendimento, novaChamada.setorNome);
            } catch (e) { console.error('Erro fala', e); }
        }
        setTimeout(() => {
            setFilasPainel(prev => {
                const clone = { ...prev };
                const existente = clone[fid];
                if (!existente) return prev;
                existente.chamadas = existente.chamadas.map(c => c.entradaFilaId === chamadaComTimestamp.entradaFilaId ? { ...c, isNew: false } : c);
                return clone;
            });
        }, 5000);
    }, [audioEnabled]);

    const toggleAudio = async () => {
        const newState = !audioEnabled;
        setAudioEnabled(newState);
        audioService.setEnabled(newState);
        if (newState) {
            try { await audioService.testarAudio(); } catch (error) { console.error('Teste de áudio falhou:', error); }
        }
    };

    const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6" role="main" aria-label="Painel público de chamadas">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl font-bold text-primary">Painel de Chamadas</h1>
                        <Badge variant={isConnected ? 'default' : 'desconectado'} className="text-sm">
                            {isConnected ? 'Online' : 'Desconectado'}
                        </Badge>
                        {semToken && (
                            <span className="text-xs text-destructive ml-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Sem credenciais: informe ?token=JWT</span>
                        )}
                        {!filaId && (
                            <span className="text-xs text-destructive ml-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Fila ausente: adicione ?fila=ID</span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleAudio} aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'} className="h-12 w-12">
                            {audioEnabled ? (
                                <Volume2 className="h-6 w-6 text-success" />
                            ) : (
                                <VolumeX className="h-6 w-6 text-muted-foreground" />
                            )}
                        </Button>

                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold">{formatTime(currentTime)}</div>
                            <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString('pt-BR')}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Chamadas recentes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Tempo real (fila: {filaId || '—'})</span>
                    </div>
                </div>
            </div>

            {/* GRID de filas quando múltiplas */}
            {Object.keys(filasPainel).length > 1 && (
                <div className="grid gap-6 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))' }}>
                    {Object.values(filasPainel).map(fila => {
                        const chamadasFila = fila.chamadas;
                        const atual = chamadasFila.find(c => c.isNew) || chamadasFila[0];
                        const ultimas = chamadasFila.filter(c => c !== atual).slice(0, 3);
                        return (
                            <Card key={fila.filaId} className={cn('relative', atual?.isNew && 'ring-2 ring-primary')}>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Fila</h2>
                                        <Badge variant={atual ? 'default' : 'secondary'}>{fila.filaId.substring(0,8)}</Badge>
                                    </div>
                                    <div className="bg-primary/5 rounded p-3 text-center min-h-[90px] flex flex-col items-center justify-center">
                                        {atual ? (
                                            <>
                                                <span className="text-xl font-bold">{atual.clienteNome}</span>
                                                <span className="text-sm text-muted-foreground">{atual.guicheOuSalaAtendimento}</span>
                                            </>
                                        ) : <span className="text-sm text-muted-foreground">Aguardando...</span>}
                                    </div>
                                    <div className="space-y-2">
                                        {ultimas.length === 0 && <p className="text-xs text-muted-foreground">Sem chamadas anteriores.</p>}
                                        {ultimas.map(u => (
                                            <div key={u.entradaFilaId} className="flex items-center justify-between text-xs">
                                                <span className="truncate max-w-[140px]">{u.clienteNome}</span>
                                                <span className="text-muted-foreground">{new Date(u.timestamp).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Lista de Chamadas (modo single / compat) */}
            {Object.keys(filasPainel).length <= 1 && (
                <div className="space-y-4" role="region" aria-label="Lista de chamadas recentes" aria-live="polite">
                    {chamadas.length === 0 ? (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <RefreshCw className="h-12 w-12" />
                                <p className="text-xl">Aguardando chamadas...</p>
                                <p className="text-sm">As chamadas aparecerão aqui em tempo real</p>
                            </div>
                        </Card>
                    ) : (
                        chamadas.map((chamada, index) => (
                            <Card key={`${chamada.entradaFilaId}-${chamada.timestampLocal}`} className={cn(
                                'transition-all duration-500',
                                chamada.isNew && 'ring-4 ring-primary ring-opacity-50 shadow-2xl bg-primary/5',
                                index === 0 && 'border-primary border-2'
                            )}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between flex-wrap gap-6">
                                        <div className="flex items-center gap-6 flex-wrap">
                                            <div>
                                                <div className="text-3xl font-bold mb-1" aria-label={`Cliente: ${chamada.clienteNome}`}>{chamada.clienteNome}</div>
                                                <div className="text-sm text-muted-foreground">Dirija-se ao local indicado</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-8 flex-wrap">
                                            <div className="text-center min-w-[140px]">
                                                <div className="text-2xl font-bold mb-1">{chamada.guicheOuSalaAtendimento}</div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Local</div>
                                            </div>
                                            <div className="text-center min-w-[100px]">
                                                <div className="text-lg font-mono">
                                                    {new Date(chamada.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Hora</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center text-muted-foreground">
                <p className="text-sm">Em caso de dúvidas, dirija-se à recepção • Sistema Q-Manager</p>
            </div>
        </div>
    );
};

export default PainelPublico;
