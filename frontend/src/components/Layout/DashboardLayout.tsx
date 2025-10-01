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
    User
} from 'lucide-react';
import { authService } from '@/services/authService';
import { websocketService } from '@/services/websocketService';
import { UsuarioResponseDTO } from '@/types';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
    const [usuario, setUsuario] = useState<UsuarioResponseDTO | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState(0);

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
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: Activity,
            description: 'Visão geral do sistema'
        },
        {
            label: 'Painel Profissional',
            path: '/painel-profissional',
            icon: Users,
            description: 'Gerenciar filas e atendimentos'
        },
        {
            label: 'Gestão',
            path: '/gestao',
            icon: Building2,
            description: 'Administrar unidades e setores'
        },
        {
            label: 'Configurações',
            path: '/configuracoes',
            icon: Settings,
            description: 'Configurações do sistema'
        }
    ];

    if (!usuario) {
        return (
            <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Carregando">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background" role="application" aria-label="Q-Manager Dashboard">
            {/* Header */}
            <header
                className="fixed top-0 left-0 right-0 z-40 bg-card border-b shadow-sm"
                role="banner"
            >
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
                            aria-expanded={sidebarOpen}
                            aria-controls="sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-primary" aria-hidden="true" />
                            <div>
                                <h1 className="text-xl font-bold text-primary">Q-Manager</h1>
                                <p className="text-xs text-muted-foreground">
                                    Sistema de Filas de Atendimento
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            aria-label={`Notificações ${notifications > 0 ? `(${notifications} não lidas)` : ''}`}
                        >
                            <Bell className="h-5 w-5" />
                            {notifications > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
                                    aria-hidden="true"
                                >
                  {notifications}
                </span>
                            )}
                        </Button>

                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span className="font-medium">{usuario.nomeUsuario}</span>
                            <span className="text-muted-foreground">({usuario.categoria})</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            aria-label="Sair do sistema"
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                id="sidebar"
                className={cn(
                    "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-sidebar border-r transition-all duration-300",
                    sidebarOpen ? "w-64" : "w-16"
                )}
                role="navigation"
                aria-label="Menu de navegação principal"
            >
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.path}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-12",
                                    !sidebarOpen && "justify-center px-0"
                                )}
                                onClick={() => navigate(item.path)}
                                aria-label={sidebarOpen ? item.label : `${item.label}: ${item.description}`}
                                title={!sidebarOpen ? item.description : undefined}
                            >
                                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                {sidebarOpen && (
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                                    </div>
                                )}
                            </Button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "transition-all duration-300 pt-16",
                    sidebarOpen ? "ml-64" : "ml-16"
                )}
                role="main"
                aria-label="Conteúdo principal"
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
