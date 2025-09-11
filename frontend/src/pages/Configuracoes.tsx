import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Save,
    Bell,
    Volume2,
    Monitor,
    Shield,
    User,
    Eye,
    EyeOff,
    RefreshCw,
    Download,
    Upload,
    Loader2
} from "lucide-react";
import { authService } from "@/services/authService";
import { usuarioService } from "@/services/usuarioService";
import { UsuarioResponseDTO, UsuarioUpdateDTO } from "@/types";

interface ConfiguracoesUsuario {
    // Notificações
    notificacoesNovasChamadas: boolean;
    notificacoesAtualizacoesFila: boolean;
    notificacoesSistema: boolean;
    emailNotificacoes: boolean;

    // Áudio
    audioHabilitado: boolean;
    volumeAudio: number;
    somChamada: string;

    // Interface
    modoEscuro: boolean;
    modoCompacto: boolean;
    intervaloAtualizacao: number;
    idiomaInterface: string;

    // Segurança
    logoutAutomatico: boolean;
    tempoLogoutMinutos: number;
    autenticacaoDoisFatores: boolean;
}

const Configuracoes = () => {
    const [config, setConfig] = useState<ConfiguracoesUsuario>({
        // Notificações
        notificacoesNovasChamadas: true,
        notificacoesAtualizacoesFila: true,
        notificacoesSistema: true,
        emailNotificacoes: false,

        // Áudio
        audioHabilitado: true,
        volumeAudio: 50,
        somChamada: 'padrao',

        // Interface
        modoEscuro: false,
        modoCompacto: false,
        intervaloAtualizacao: 10,
        idiomaInterface: 'pt-BR',

        // Segurança
        logoutAutomatico: true,
        tempoLogoutMinutos: 30,
        autenticacaoDoisFatores: false
    });

    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [usuario, setUsuario] = useState<UsuarioResponseDTO | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        carregarConfiguracoes();
    }, []);

    const carregarConfiguracoes = async () => {
        try {
            setLoading(true);

            const currentUser = authService.getUsuario();
            if (currentUser) {
                setUsuario(currentUser);
            }

            // Carregar configurações do localStorage
            const configSalva = localStorage.getItem('qmanager_config');
            if (configSalva) {
                const configParsed = JSON.parse(configSalva);
                setConfig({ ...config, ...configParsed });
            }

            console.log('✅ Configurações carregadas');
        } catch (error: any) {
            console.error('❌ Erro ao carregar configurações:', error);
            toast({
                title: 'Erro ao carregar configurações',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const salvarConfiguracoes = async () => {
        try {
            setSalvando(true);

            // Salvar configurações no localStorage
            localStorage.setItem('qmanager_config', JSON.stringify(config));

            // Aplicar configurações imediatamente
            aplicarConfiguracoes();

            toast({
                title: 'Configurações salvas!',
                description: 'Suas preferências foram atualizadas com sucesso.',
            });

            console.log('✅ Configurações salvas');
        } catch (error: any) {
            console.error('❌ Erro ao salvar configurações:', error);
            toast({
                title: 'Erro ao salvar',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSalvando(false);
        }
    };

    const aplicarConfiguracoes = () => {
        // Aplicar modo escuro
        if (config.modoEscuro) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Configurar volume de áudio
        if (typeof window !== 'undefined' && 'Audio' in window) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContext.destination.volume = config.volumeAudio / 100;
        }

        console.log('🎨 Configurações aplicadas à interface');
    };

    const alterarSenha = async () => {
        try {
            if (!senhaAtual || !novaSenha || !confirmarSenha) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Preencha todos os campos de senha.',
                    variant: 'destructive',
                });
                return;
            }

            if (novaSenha !== confirmarSenha) {
                toast({
                    title: 'Senhas não conferem',
                    description: 'A nova senha e a confirmação devem ser iguais.',
                    variant: 'destructive',
                });
                return;
            }

            if (novaSenha.length < 6) {
                toast({
                    title: 'Senha muito curta',
                    description: 'A nova senha deve ter pelo menos 6 caracteres.',
                    variant: 'destructive',
                });
                return;
            }

            setSalvando(true);

            // Simular alteração de senha (aqui você integraria com a API)
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: 'Senha alterada!',
                description: 'Sua senha foi alterada com sucesso.',
            });

            // Limpar campos
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error: any) {
            toast({
                title: 'Erro ao alterar senha',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSalvando(false);
        }
    };

    const testarSom = () => {
        if (config.audioHabilitado) {
            // Simular som de teste
            toast({
                title: '🔊 Som de teste',
                description: 'Este seria o som de chamada configurado.',
            });
        } else {
            toast({
                title: 'Áudio desabilitado',
                description: 'Habilite o áudio para testar os sons.',
                variant: 'destructive',
            });
        }
    };

    const exportarConfiguracoes = () => {
        const dadosExportacao = {
            configuracoes: config,
            usuario: usuario?.nomeUsuario,
            dataExportacao: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qmanager-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: 'Configurações exportadas!',
            description: 'Arquivo de configurações baixado com sucesso.',
        });
    };

    const importarConfiguracoes = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.configuracoes) {
                    setConfig(data.configuracoes);
                    toast({
                        title: 'Configurações importadas!',
                        description: 'Suas configurações foram restauradas. Clique em Salvar para aplicar.',
                    });
                } else {
                    throw new Error('Formato de arquivo inválido');
                }
            } catch (error) {
                toast({
                    title: 'Erro ao importar',
                    description: 'Arquivo de configurações inválido.',
                    variant: 'destructive',
                });
            }
        };
        reader.readAsText(file);
    };

    const resetarConfiguracoes = () => {
        setConfig({
            notificacoesNovasChamadas: true,
            notificacoesAtualizacoesFila: true,
            notificacoesSistema: true,
            emailNotificacoes: false,
            audioHabilitado: true,
            volumeAudio: 50,
            somChamada: 'padrao',
            modoEscuro: false,
            modoCompacto: false,
            intervaloAtualizacao: 10,
            idiomaInterface: 'pt-BR',
            logoutAutomatico: true,
            tempoLogoutMinutos: 30,
            autenticacaoDoisFatores: false
        });

        toast({
            title: 'Configurações resetadas',
            description: 'Todas as configurações foram restauradas para os valores padrão.',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Carregando configurações">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="main" aria-label="Página de configurações">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">
                        Personalize sua experiência no Q-Manager
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={resetarConfiguracoes}
                        aria-label="Resetar todas as configurações"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resetar
                    </Button>
                    <Button
                        onClick={salvarConfiguracoes}
                        disabled={salvando}
                        aria-label="Salvar configurações"
                    >
                        {salvando ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Salvar
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Notificações */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificações
                        </CardTitle>
                        <CardDescription>
                            Configure como você quer receber notificações
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="notif-chamadas">Novas chamadas</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba notificações quando uma nova chamada for gerada
                                </p>
                            </div>
                            <Switch
                                id="notif-chamadas"
                                checked={config.notificacoesNovasChamadas}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, notificacoesNovasChamadas: checked})
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="notif-fila">Atualizações da fila</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba notificações sobre mudanças na fila
                                </p>
                            </div>
                            <Switch
                                id="notif-fila"
                                checked={config.notificacoesAtualizacoesFila}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, notificacoesAtualizacoesFila: checked})
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="notif-sistema">Notificações do sistema</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba notificações importantes do sistema
                                </p>
                            </div>
                            <Switch
                                id="notif-sistema"
                                checked={config.notificacoesSistema}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, notificacoesSistema: checked})
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="notif-email">Notificações por email</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba notificações também por email
                                </p>
                            </div>
                            <Switch
                                id="notif-email"
                                checked={config.emailNotificacoes}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, emailNotificacoes: checked})
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Áudio */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Volume2 className="h-5 w-5" />
                            Áudio
                        </CardTitle>
                        <CardDescription>
                            Configure as preferências de áudio do sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="audio-enabled">Habilitar áudio</Label>
                                <p className="text-sm text-muted-foreground">
                                    Reproduzir sons para notificações e chamadas
                                </p>
                            </div>
                            <Switch
                                id="audio-enabled"
                                checked={config.audioHabilitado}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, audioHabilitado: checked})
                                }
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="audio-volume">Volume: {config.volumeAudio}%</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={testarSom}
                                    disabled={!config.audioHabilitado}
                                >
                                    Testar Som
                                </Button>
                            </div>
                            <Input
                                id="audio-volume"
                                type="range"
                                min="0"
                                max="100"
                                value={config.volumeAudio}
                                onChange={(e) =>
                                    setConfig({...config, volumeAudio: parseInt(e.target.value)})
                                }
                                className="w-full"
                                disabled={!config.audioHabilitado}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="som-chamada">Som de chamada</Label>
                            <Select
                                value={config.somChamada}
                                onValueChange={(value) => setConfig({...config, somChamada: value})}
                                disabled={!config.audioHabilitado}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="padrao">Som Padrão</SelectItem>
                                    <SelectItem value="campainha">Campainha</SelectItem>
                                    <SelectItem value="sino">Sino</SelectItem>
                                    <SelectItem value="beep">Beep</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Interface */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Interface
                        </CardTitle>
                        <CardDescription>
                            Personalize a aparência da interface
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="modo-escuro">Modo escuro</Label>
                                <p className="text-sm text-muted-foreground">
                                    Ativar tema escuro da interface
                                </p>
                            </div>
                            <Switch
                                id="modo-escuro"
                                checked={config.modoEscuro}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, modoEscuro: checked})
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="modo-compacto">Modo compacto</Label>
                                <p className="text-sm text-muted-foreground">
                                    Reduzir espaçamentos para mais informações na tela
                                </p>
                            </div>
                            <Switch
                                id="modo-compacto"
                                checked={config.modoCompacto}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, modoCompacto: checked})
                                }
                            />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="intervalo-atualizacao">Intervalo de atualização (segundos)</Label>
                                <Input
                                    id="intervalo-atualizacao"
                                    type="number"
                                    min="5"
                                    max="60"
                                    value={config.intervaloAtualizacao}
                                    onChange={(e) =>
                                        setConfig({...config, intervaloAtualizacao: parseInt(e.target.value)})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="idioma">Idioma da interface</Label>
                                <Select
                                    value={config.idiomaInterface}
                                    onValueChange={(value) => setConfig({...config, idiomaInterface: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                        <SelectItem value="en-US">English (US)</SelectItem>
                                        <SelectItem value="es-ES">Español</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Segurança */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Segurança
                        </CardTitle>
                        <CardDescription>
                            Configure opções de segurança da conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Alterar Senha */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Alterar Senha</h4>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="senha-atual">Senha atual</Label>
                                    <div className="relative">
                                        <Input
                                            id="senha-atual"
                                            type={mostrarSenhaAtual ? "text" : "password"}
                                            value={senhaAtual}
                                            onChange={(e) => setSenhaAtual(e.target.value)}
                                            placeholder="Digite sua senha atual"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                            onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                                            aria-label={mostrarSenhaAtual ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {mostrarSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nova-senha">Nova senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="nova-senha"
                                            type={mostrarNovaSenha ? "text" : "password"}
                                            value={novaSenha}
                                            onChange={(e) => setNovaSenha(e.target.value)}
                                            placeholder="Digite a nova senha"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                            onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                                            aria-label={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {mostrarNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmar-senha"
                                            type={mostrarConfirmarSenha ? "text" : "password"}
                                            value={confirmarSenha}
                                            onChange={(e) => setConfirmarSenha(e.target.value)}
                                            placeholder="Confirme a nova senha"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                            onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                            aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={alterarSenha}
                                disabled={salvando || !senhaAtual || !novaSenha || !confirmarSenha}
                            >
                                {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                                Alterar Senha
                            </Button>
                        </div>

                        <Separator />

                        {/* Configurações de Sessão */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="logout-automatico">Logout automático</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Sair automaticamente após período de inatividade
                                    </p>
                                </div>
                                <Switch
                                    id="logout-automatico"
                                    checked={config.logoutAutomatico}
                                    onCheckedChange={(checked) =>
                                        setConfig({...config, logoutAutomatico: checked})
                                    }
                                />
                            </div>

                            {config.logoutAutomatico && (
                                <div className="space-y-2">
                                    <Label htmlFor="tempo-logout">Tempo limite (minutos)</Label>
                                    <Input
                                        id="tempo-logout"
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={config.tempoLogoutMinutos}
                                        onChange={(e) =>
                                            setConfig({...config, tempoLogoutMinutos: parseInt(e.target.value)})
                                        }
                                        className="w-32"
                                    />
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="2fa">Autenticação de dois fatores</Label>
                                <p className="text-sm text-muted-foreground">
                                    Adicionar uma camada extra de segurança à sua conta
                                </p>
                            </div>
                            <Switch
                                id="2fa"
                                checked={config.autenticacaoDoisFatores}
                                onCheckedChange={(checked) =>
                                    setConfig({...config, autenticacaoDoisFatores: checked})
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Backup e Restauração */}
                <Card>
                    <CardHeader>
                        <CardTitle>Backup e Restauração</CardTitle>
                        <CardDescription>
                            Faça backup ou restaure suas configurações
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={exportarConfiguracoes}
                                className="flex-1"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Exportar Configurações
                            </Button>

                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={importarConfiguracoes}
                                    className="hidden"
                                    id="import-config"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('import-config')?.click()}
                                    className="w-full"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Importar Configurações
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Use estas opções para fazer backup de suas preferências ou transferir configurações entre dispositivos.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Configuracoes;
