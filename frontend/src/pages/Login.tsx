import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, Mail, Lock, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { unidadeService } from '@/services/unidadeService';
import { UnidadeAtendimentoPublicDTO, LoginRequest } from '@/types';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [unidadeAtendimentoId, setUnidadeAtendimentoId] = useState<string>('');
    const [unidades, setUnidades] = useState<UnidadeAtendimentoPublicDTO[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUnidades, setIsLoadingUnidades] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { toast } = useToast();
    const { login, isAuthenticated } = useAuth();

    const loadUnidades = useCallback(async () => {
        try {
            setIsLoadingUnidades(true);
            setError('');

            const unidadesData = await unidadeService.listarParaLogin();
            setUnidades(unidadesData);

            console.log('✅ Unidades carregadas:', unidadesData.length);
        } catch (error: any) {
            console.error('❌ Erro ao carregar unidades:', error);
            setError('Erro ao carregar unidades de atendimento. Tente novamente.');
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as unidades de atendimento.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingUnidades(false);
        }
    }, [toast]);

    // Efeito separado para redirecionamento
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Carregar unidades sempre ao renderizar a tela de login
    useEffect(() => {
        loadUnidades();
        // Limpar unidades ao desmontar
        return () => setUnidades([]);
    }, [loadUnidades]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim() || !unidadeAtendimentoId) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const credentials: LoginRequest = {
                username: username.trim(),
                password: password.trim(),
                unidadeAtendimentoId
            };

            await login(credentials);

            toast({
                title: 'Sucesso!',
                description: 'Login realizado com sucesso.',
            });

            // Redirecionar será feito automaticamente pelo useEffect quando isAuthenticated mudar
        } catch (error: any) {
            console.error('❌ Erro no login:', error);
            setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
            toast({
                title: 'Erro no Login',
                description: error.message || 'Verifique suas credenciais e tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo e título */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Q-Manager</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Sistema de Gestão de Filas Inteligentes
                    </p>
                </div>

                {/* Card de Login */}
                <Card className="shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
                        <CardDescription className="text-center">
                            Digite suas credenciais para acessar o sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Erro geral */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Campo de usuário/email */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Usuário ou Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Digite seu usuário ou email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Campo de senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Digite sua senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>

                            {/* Seleção de unidade */}
                            <div className="space-y-2">
                                <Label htmlFor="unidade">Unidade de Atendimento</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={unidadeAtendimentoId}
                                        onValueChange={setUnidadeAtendimentoId}
                                        disabled={isLoading || isLoadingUnidades}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Selecione a unidade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades.map((unidade) => (
                                                <SelectItem key={unidade.id} value={unidade.id}>
                                                    {unidade.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={loadUnidades}
                                        disabled={isLoading || isLoadingUnidades}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoadingUnidades ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                {unidades.length === 0 && !isLoadingUnidades && (
                                    <p className="text-sm text-gray-500">
                                        Nenhuma unidade encontrada. Tente recarregar.
                                    </p>
                                )}
                            </div>

                            {/* Botão de login */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || isLoadingUnidades || !username.trim() || !password.trim() || !unidadeAtendimentoId}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>

                        {/* Links adicionais */}
                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Não tem uma conta?{' '}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    Cadastre-se aqui
                                </Link>
                            </p>
                            <p className="text-xs text-gray-500">
                                Q-Manager v1.0 - Sistema de Gestão de Filas
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
