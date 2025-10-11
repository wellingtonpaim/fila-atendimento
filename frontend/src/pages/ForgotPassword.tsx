import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validação do email
        if (!email.trim()) {
            setError('Por favor, informe seu e-mail');
            return;
        }

        if (!validateEmail(email)) {
            setError('Por favor, informe um e-mail válido');
            return;
        }

        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
            setEmail(''); // Limpar campo
        } catch (err: any) {
            // Sempre mostrar mensagem neutra por segurança
            setSuccess(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center mb-2">
                        <Link to="/login" className="mr-2">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <CardTitle className="text-2xl font-bold">Esqueci minha senha</CardTitle>
                    </div>
                    <CardDescription>
                        Informe seu e-mail cadastrado e enviaremos instruções para redefinir sua senha
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {success && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    <strong>E-mail enviado!</strong>
                                    <br />
                                    Se este e-mail estiver cadastrado em nosso sistema, você receberá instruções para redefinir sua senha em breve.
                                    <br />
                                    <span className="text-sm text-green-700 mt-2 block">
                                        Não esqueça de verificar sua caixa de spam.
                                    </span>
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
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
                                    disabled={loading || success}
                                    autoFocus
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || success}
                        >
                            {loading ? 'Enviando...' : 'Enviar instruções'}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Lembrou sua senha?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline font-medium">
                                Fazer login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

