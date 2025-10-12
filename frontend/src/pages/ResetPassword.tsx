import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Validar token ao carregar a página
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Token de redefinição não encontrado');
                setValidatingToken(false);
                return;
            }

            setValidatingToken(true);
            const isValid = await authService.validateResetToken(token);
            setTokenValid(isValid);
            
            if (!isValid) {
                setError('Token inválido ou expirado. Por favor, solicite um novo link de redefinição.');
            }
            
            setValidatingToken(false);
        };

        validateToken();
    }, [token]);

    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('A senha deve ter pelo menos 8 caracteres');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra maiúscula');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra minúscula');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('A senha deve conter pelo menos um número');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('A senha deve conter pelo menos um caractere especial');
        }

        return { valid: errors.length === 0, errors };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validações
        if (!novaSenha.trim()) {
            setError('Por favor, informe a nova senha');
            return;
        }

        const validation = validatePassword(novaSenha);
        if (!validation.valid) {
            setError(validation.errors.join('. '));
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setError('As senhas não coincidem');
            return;
        }

        if (!token) {
            setError('Token não encontrado');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, novaSenha);
            setSuccess(true);
            
            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Renderizar loading enquanto valida token
    if (validatingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Validando token...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Renderizar erro se token inválido
    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Token Inválido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button
                            onClick={() => navigate('/forgot-password')}
                            className="w-full"
                        >
                            Solicitar novo link
                        </Button>
                        <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                                Voltar ao login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Renderizar sucesso
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Senha Redefinida!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Sua senha foi redefinida com sucesso! Você será redirecionado para a tela de login em instantes...
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full"
                        >
                            Ir para o login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Renderizar formulário de redefinição
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
                    <CardDescription>
                        Escolha uma nova senha forte para sua conta
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="novaSenha">Nova senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="novaSenha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua nova senha"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    className="pl-10 pr-10"
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmarSenha"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirme sua nova senha"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className="pl-10 pr-10"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-sm text-blue-900 font-medium mb-2">A senha deve conter:</p>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Pelo menos 8 caracteres</li>
                                <li>• Letras maiúsculas e minúsculas</li>
                                <li>• Pelo menos um número</li>
                                <li>• Pelo menos um caractere especial (!@#$%...)</li>
                            </ul>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Redefinindo...' : 'Redefinir senha'}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            <Link to="/login" className="text-blue-600 hover:underline font-medium">
                                Voltar ao login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

