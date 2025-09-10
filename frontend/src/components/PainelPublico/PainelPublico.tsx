import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Volume2,
    VolumeX,
    Clock,
    Users,
    RefreshCw
} from 'lucide-react';
import { websocketService } from '@/services/websocketService';
import { audioService } from '@/services/audioService';
import { ChamadaWebSocket } from '@/types';
import { cn } from '@/lib/utils';

interface ChamadaAtual extends ChamadaWebSocket {
    timestamp: number;
    isNew: boolean;
}

const PainelPublico = () => {
    const [chamadas, setChamadas] = useState<ChamadaAtual[]>([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isConnected, setIsConnected] = useState(false);

    // Atualizar relógio a cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Configurar WebSocket
    useEffect(() => {
        // Conectar ao WebSocket para painéis públicos
        const token = 'painel-publico'; // Token específico para painéis públicos
        websocketService.connect(token);

        setIsConnected(websocketService.isConnected());

        const unsubscribe = websocketService.subscribe('/topic/painel', handleNovaChamada);

        return () => {
            unsubscribe();
            websocketService.disconnect();
        };
    }, []);

    const handleNovaChamada = useCallback(async (novaChamada: ChamadaWebSocket) => {
        const chamadaComTimestamp: ChamadaAtual = {
            ...novaChamada,
            timestamp: Date.now(),
            isNew: true
        };

        setChamadas(prev => {
            const novasChamadas = [chamadaComTimestamp, ...prev.slice(0, 9)]; // Manter apenas 10 chamadas
            return novasChamadas.map((c, index) => ({
                ...c,
                isNew: index === 0 // Apenas a primeira é nova
            }));
        });

        // Vocalizar se o áudio estiver habilitado
        if (audioEnabled) {
            try {
                await audioService.vocalizarChamada(
                    novaChamada.clienteNome,
                    novaChamada.sala,
                    novaChamada.setorNome
                );
            } catch (error) {
                console.error('Erro na vocalização:', error);
            }
        }

        // Remover o destaque "novo" após alguns segundos
        setTimeout(() => {
            setChamadas(prev =>
                prev.map(c =>
                    c.entradaFilaId === chamadaComTimestamp.entradaFilaId
                        ? { ...c, isNew: false }
                        : c
                )
            );
        }, 5000);
    }, [audioEnabled]);

    const toggleAudio = async () => {
        const newState = !audioEnabled;
        setAudioEnabled(newState);
        audioService.setEnabled(newState);

        if (newState) {
            try {
                await audioService.testarAudio();
            } catch (error) {
                console.error('Teste de áudio falhou:', error);
            }
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getCorSetor = (setorNome: string) => {
        const cores = {
            'Recepção': 'bg-blue-500',
            'Triagem': 'bg-yellow-500',
            'Consultório': 'bg-green-500',
            'Exames': 'bg-purple-500',
            'Emergência': 'bg-red-500',
            'default': 'bg-primary'
        };

        return cores[setorNome as keyof typeof cores] || cores.default;
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6"
            role="main"
            aria-label="Painel público de chamadas"
        >
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold text-primary">
                            Painel de Chamadas
                        </h1>
                        <Badge
                            variant={isConnected ? "default" : "destructive"}
                            className="text-sm"
                        >
                            {isConnected ? 'Online' : 'Desconectado'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleAudio}
                            aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
                            className="h-12 w-12"
                        >
                            {audioEnabled ? (
                                <Volume2 className="h-6 w-6 text-success" />
                            ) : (
                                <VolumeX className="h-6 w-6 text-muted-foreground" />
                            )}
                        </Button>

                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold">
                                {formatTime(currentTime)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {currentTime.toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Chamadas recentes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Atualização em tempo real</span>
                    </div>
                </div>
            </div>

            {/* Lista de Chamadas */}
            <div
                className="space-y-4"
                role="region"
                aria-label="Lista de chamadas recentes"
                aria-live="polite"
            >
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
                        <Card
                            key={`${chamada.entradaFilaId}-${chamada.timestamp}`}
                            className={cn(
                                "transition-all duration-500",
                                chamada.isNew && "ring-4 ring-primary ring-opacity-50 shadow-2xl bg-primary/5",
                                index === 0 && "border-primary border-2"
                            )}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        {/* Senha */}
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-primary mb-1">
                                                {chamada.senha}
                                            </div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                                Senha
                                            </div>
                                        </div>

                                        {/* Nome do Cliente */}
                                        <div>
                                            <div
                                                className="text-2xl font-semibold mb-1"
                                                aria-label={`Paciente: ${chamada.clienteNome}`}
                                            >
                                                {chamada.clienteNome}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Favor dirigir-se ao local indicado
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex items-center gap-4">
                                        {/* Setor */}
                                        <div className="text-center">
                                            <Badge
                                                className={cn(
                                                    "text-white text-lg px-4 py-2 mb-2",
                                                    getCorSetor(chamada.setorNome)
                                                )}
                                            >
                                                {chamada.setorNome}
                                            </Badge>
                                            <div className="text-2xl font-bold">
                                                {chamada.sala}
                                            </div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                                Local
                                            </div>
                                        </div>

                                        {/* Horário */}
                                        <div className="text-center min-w-[100px]">
                                            <div className="text-lg font-mono">
                                                {new Date(chamada.horarioChamada).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                                Hora
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-muted-foreground">
                <p className="text-sm">
                    Em caso de dúvidas, dirija-se à recepção • Sistema Q-Manager
                </p>
            </div>
        </div>
    );
};

export default PainelPublico;