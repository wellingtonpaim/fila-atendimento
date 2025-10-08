import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Users,
    Activity,
    Building2,
    Settings,
    LogOut,
    Menu,
    Bell,
    User,
    MonitorPlay,
    Loader2
} from 'lucide-react';
import { authService } from '@/services/authService';
import { websocketService } from '@/services/websocketService';
import { painelService } from '@/services/painelService';
import {PainelResponseDTO, UsuarioResponseDTO} from '@/types';
import { cn } from '@/lib/utils';
import { filaService } from '@/services/filaService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const DashboardLayout = () => {
    const [usuario, setUsuario] = useState<UsuarioResponseDTO | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState(0);
    // Estados para o diálogo de seleção de painel
    const [showPainelDialog, setShowPainelDialog] = useState(false);
    const [paineisDisponiveis, setPaineisDisponiveis] = useState<PainelResponseDTO[]>([]);
    const [loadingPaineis, setLoadingPaineis] = useState(false);
    const [selectedPainelId, setSelectedPainelId] = useState<string | null>(null);
    const [erroPaineis, setErroPaineis] = useState<string | null>(null);

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const currentUser = authService.getUsuario();
        if (!currentUser) {
            navigate('/login', { replace: true });
            return;
        }
        setUsuario(currentUser);

        // Conectar WebSocket se autenticado
        const token = authService.getToken();
        if (token) {
            websocketService.connect(token);
        }

        return () => {
            websocketService.disconnect();
        };
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        websocketService.disconnect();
        setUsuario(null); // Limpa o estado imediatamente
        toast({
            title: 'Logout realizado',
            description: 'Você foi desconectado com sucesso.',
        });
        navigate('/login', { replace: true });
    };

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', icon: Activity, description: 'Visão geral do sistema' },
        { label: 'Painel Público', action: 'openPainelDialog', icon: MonitorPlay, description: 'Abrir painel de TV com chamadas' },
        { label: 'Painel Profissional', path: '/painel-profissional', icon: Users, description: 'Gerenciar filas e atendimentos' },
        { label: 'Gestão', path: '/gestao', icon: Building2, description: 'Administrar unidades e setores' },
        { label: 'Configurações', path: '/configuracoes', icon: Settings, description: 'Configurações do sistema' }
    ];

    const abrirDialogPainel = async () => {
        setShowPainelDialog(true);
        setSelectedPainelId(null);
        setLoadingPaineis(true);
        setErroPaineis(null);
        try {
            const unidadeId = authService.getSelectedUnitId();
            if (!unidadeId) {
                setErroPaineis('Unidade não selecionada. Faça login novamente.');
            } else {
                const resp = await painelService.listarPorUnidade(unidadeId);
                if (resp.success) {
                    setPaineisDisponiveis(resp.data);
                } else {
                    setErroPaineis(resp.message || 'Falha ao carregar painéis.');
                }
            }
        } catch (e: any) {
            setErroPaineis(e.message || 'Erro ao buscar painéis.');
        } finally {
            setLoadingPaineis(false);
        }
    };

    const confirmarAbrirPainel = () => {
        if (!selectedPainelId) {
            toast({ title: 'Selecione um painel', description: 'Escolha um painel para abrir em uma nova aba.', variant: 'destructive' });
            return;
        }
        const token = authService.getToken(); // Token para autenticação do WebSocket no painel
        const params = new URLSearchParams();
        if (token) params.set('token', token);
        params.set('painelId', selectedPainelId);

        const url = `${window.location.origin}/painel-publico?${params.toString()}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setShowPainelDialog(false);
    };

    if (!usuario) {
        return (
            <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Carregando">
                <Loader2 className="h-32 w-32 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background" role="application" aria-label="Q-Manager Dashboard">
            <Dialog open={showPainelDialog} onOpenChange={setShowPainelDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Abrir Painel Público</DialogTitle>
                        <DialogDescription>
                            Escolha qual painel configurado você deseja exibir em uma nova aba.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-2">
                        {loadingPaineis && <p className="text-sm text-muted-foreground">Carregando painéis...</p>}
                        {erroPaineis && <p className="text-sm text-destructive">{erroPaineis}</p>}
                        {!loadingPaineis && !erroPaineis && paineisDisponiveis.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhum painel encontrado para esta unidade.</p>
                        )}
                        <RadioGroup value={selectedPainelId || ''} onValueChange={setSelectedPainelId}>
                            {paineisDisponiveis.map(painel => (
                                <Label key={painel.id} htmlFor={painel.id} className="flex items-start gap-3 text-sm cursor-pointer select-none p-3 rounded-lg hover:bg-muted/50 border has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30">
                                    <RadioGroupItem value={painel.id} id={painel.id} />
                                    <span className="flex-1">
                                        <span className="font-medium">{painel.descricao}</span>
                                        <span className="block text-xs text-muted-foreground">{painel.filasIds.length} fila(s) vinculada(s)</span>
                                    </span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </div>
                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setShowPainelDialog(false)}>Cancelar</Button>
                        <Button onClick={confirmarAbrirPainel} disabled={!selectedPainelId}>Abrir Painel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b shadow-sm" role="banner">
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'} aria-expanded={sidebarOpen} aria-controls="sidebar">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-primary" aria-hidden="true" />
                            <div>
                                <h1 className="text-xl font-bold text-primary">Q-Manager</h1>
                                <p className="text-xs text-muted-foreground">Sistema de Filas de Atendimento</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative" aria-label={`Notificações`}>
                            <Bell className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span className="font-medium">{usuario.nomeUsuario}</span>
                            <span className="text-muted-foreground">({usuario.categoria})</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair do sistema" className="text-muted-foreground hover:text-destructive">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <aside id="sidebar" className={cn("fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300", sidebarOpen ? "w-64" : "w-16")} role="navigation" aria-label="Menu de navegação principal">
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.label}
                                variant="ghost"
                                className={cn("w-full justify-start gap-3 h-12", !sidebarOpen && "justify-center px-0")}
                                onClick={() => {
                                    if (item.action === 'openPainelDialog') {
                                        abrirDialogPainel();
                                    } else if (item.path) {
                                        navigate(item.path);
                                    }
                                }}
                                aria-label={sidebarOpen ? item.label : `${item.label}: ${item.description}`}
                                title={!sidebarOpen ? item.description : undefined}
                            >
                                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                {sidebarOpen && (
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-xs text-muted-foreground">{item.description}</span>
                                    </div>
                                )}
                            </Button>
                        );
                    })}
                </nav>
            </aside>

            <main className={cn("transition-all duration-300 pt-16", sidebarOpen ? "ml-64" : "ml-16")} role="main" aria-label="Conteúdo principal">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;