import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, Mail, Lock, Loader2, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UsuarioCreateDTO } from '@/types';

const Register: React.FC = () => {
    const [formData, setFormData] = useState<UsuarioCreateDTO>({
        nomeUsuario: '',
        email: '',
        senha: '',
        categoria: 'USUARIO' // Padrão para novos usuários
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { register } = useAuth();

    const handleChange = (field: keyof UsuarioCreateDTO, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(''); // Limpar erro ao digitar
    };

    const validateForm = (): boolean => {
        if (!formData.nomeUsuario.trim()) {
            setError('Nome de usuário é obrigatório.');
            return false;
        }

        if (formData.nomeUsuario.trim().length < 3) {
            setError('Nome de usuário deve ter pelo menos 3 caracteres.');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Email é obrigatório.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email inválido.');
            return false;
        }

        if (!formData.senha) {
            setError('Senha é obrigatória.');
            return false;
        }

        if (formData.senha.length < 6) {
            setError('Senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        if (formData.senha !== confirmPassword) {
            setError('Senhas não conferem.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            await register(formData);

            setSuccess(true);
            toast({
                title: 'Conta criada com sucesso!',
                description: 'Verifique seu email para ativar a conta antes de fazer login.',
            });

            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error: any) {
            console.error('❌ Erro no registro:', error);
            setError(error.message || 'Erro ao criar conta. Tente novamente.');
            toast({
                title: 'Erro no Registro',
                description: error.message || 'Erro ao criar conta. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700">Conta Criada!</CardTitle>
                        <CardDescription>
                            Sua conta foi criada com sucesso
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <Alert className="border-green-200 bg-green-50">
                            <AlertDescription className="text-green-700">
                                Enviamos um email de confirmação para <strong>{formData.email}</strong>. 
                                Clique no link do email para ativar sua conta antes de fazer login.
                            </AlertDescription>
                        </Alert>
                        <p className="text-sm text-gray-600">
                            Você será redirecionado para a tela de login em alguns segundos...
                        </p>
                        <Link to="/login">
                            <Button className="w-full">
                                Ir para Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                        Criar nova conta no sistema
                    </p>
                </div>

                {/* Card de Registro */}
                <Card className="shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
                        <CardDescription className="text-center">
                            Preencha os dados para criar sua conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Erro geral */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Nome de usuário */}
                            <div className="space-y-2">
                                <Label htmlFor="nomeUsuario">Nome de Usuário</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="nomeUsuario"
                                        type="text"
                                        placeholder="Digite seu nome de usuário"
                                        value={formData.nomeUsuario}
                                        onChange={(e) => handleChange('nomeUsuario', e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Digite seu email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="senha"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Digite sua senha"
                                        value={formData.senha}
                                        onChange={(e) => handleChange('senha', e.target.value)}
                                        className="pl-10 pr-10"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Mínimo de 6 caracteres
                                </p>
                            </div>

                            {/* Confirmar senha */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirme sua senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>

                            {/* Botão de criar conta */}
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    'Criar Conta'
                                )}
                            </Button>
                        </form>

                        {/* Links adicionais */}
                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Faça login aqui
                                </Link>
                            </p>
                            <div className="pt-4">
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Voltar ao login
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;
