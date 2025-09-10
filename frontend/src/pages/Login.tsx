import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, Mail, Lock, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { unidadeService } from '@/services/unidadeService';
import { UnidadeAtendimentoLogin } from '@/types';

const mockUnidades: UnidadeAtendimentoLogin[] = [
    { id: '1', nome: 'Unidade Exemplo 1' },
    { id: '2', nome: 'Unidade Exemplo 2' },
];

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [unidadeId, setUnidadeId] = useState<string>('');
    const [unidades, setUnidades] = useState<UnidadeAtendimentoLogin[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUnidades, setIsLoadingUnidades] = useState(false);
    const [error, setError] = useState('');
    const [selectOpen, setSelectOpen] = useState(false);
    const [unidadesError, setUnidadesError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { toast } = useToast();

    const loadUnidades = async (force = false) => {
        try {
            setUnidadesError(null);
            setIsLoadingUnidades(true);
            console.log('🔄 Carregando unidades de atendimento (lazy)... force=', force);
            console.log('🔗 URL da API:', `${import.meta.env.VITE_API_BASE_URL}/api/unidades-atendimento/public/login`);
            const unidadesData = await unidadeService.getUnidadesParaLogin(force);
            setUnidades(unidadesData);
            if (unidadesData.length === 0) {
                setUnidadesError('Nenhuma unidade disponível');
            }
            console.log('✅ Unidades carregadas da API:', unidadesData);
        } catch (apiError) {
            console.warn('⚠️ Erro ao carregar unidades, usando mock:', apiError);
            setUnidades(mockUnidades);
            setUnidadesError('Falha ao carregar da API. Exibindo exemplo.');
            toast({
                title: 'Aviso',
                description: 'Não foi possível carregar unidades da API. Usando dados de exemplo.',
                variant: 'default',
            });
        } finally {
            setIsLoadingUnidades(false);
        }
    };

    useEffect(() => {
        console.log('🔄 Login useEffect executando (redirect check)...');
        try {
            if (authService && authService.isAuthenticated()) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao verificar autenticação:', error);
        }
    }, [navigate]);

    const handleSelectOpenChange = (open: boolean) => {
        setSelectOpen(open);
        if (open) {
            // Só busca se ainda não carregou nada (ou apenas mock) ou houve erro anterior
            if ((unidades.length === 0 || unidades === mockUnidades || unidadesError) && !isLoadingUnidades) {
                loadUnidades();
            }
        }
    };

    const forceReloadUnidades = () => {
        unidadeService.clearCache?.();
        loadUnidades(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !senha || !unidadeId) {
            setError('Todos os campos são obrigatórios');
            setIsLoading(false);
            return;
        }

        try {
            const loginData = { email, senha, unidadeId };
            
            await authService.login(loginData);
            
            toast({
                title: 'Login realizado com sucesso',
                description: 'Bem-vindo ao Q-Manager!',
            });
            
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro no login';
            console.error('❌ Erro no login:', errorMessage);
            setError(errorMessage);
            toast({
                title: 'Erro no login',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Q-Manager
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Sistema de Gestão de Filas
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-8 w-8 p-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="unidade">Unidade de Atendimento</Label>
                                {unidades.length > 0 && (
                                    <Button type="button" variant="ghost" size="sm" onClick={forceReloadUnidades} disabled={isLoadingUnidades}>
                                        {isLoadingUnidades ? 'Atualizando...' : 'Recarregar'}
                                    </Button>
                                )}
                            </div>
                            <Select
                                open={selectOpen}
                                onOpenChange={handleSelectOpenChange}
                                value={unidadeId}
                                onValueChange={setUnidadeId}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue 
                                        placeholder={
                                            isLoadingUnidades 
                                                ? 'Carregando unidades...'
                                                : (unidadesError ? unidadesError : 'Selecione uma unidade')
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingUnidades && (
                                        <SelectItem disabled value="__loading">Carregando...</SelectItem>
                                    )}
                                    {!isLoadingUnidades && unidadesError && (
                                        <SelectItem disabled value="__erro">{unidadesError}</SelectItem>
                                    )}
                                    {!isLoadingUnidades && unidades.map((unidade) => (
                                        <SelectItem key={unidade.id} value={unidade.id}>
                                            {unidade.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || isLoadingUnidades}
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
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;