'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { MvLogo } from '@/components/icons/mv-logo';
import { loginSchema, LoginDto as LoginForm, tagoneAuthLoginSchema, TagOneAuthLoginDto } from '@/shared';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'local' | 'tagone'>('local');
  const { login, loginWithTagOne } = useAuth();
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const tagoneForm = useForm<TagOneAuthLoginDto>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Reset erro quando mudamos o tipo de login
  useEffect(() => {
    setError('');
  }, [loginType]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data);
      router.push('/admin');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const onTagOneSubmit = async (data: TagOneAuthLoginDto) => {
    setIsLoading(true);
    setError('');

    try {
      await loginWithTagOne(data);
      router.push('/admin');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Credenciais TagOne inválidas. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MvLogo className="w-32 h-32 border-2 border-gray-200 rounded-full bg-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão MV</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sistema de gestão empresarial</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar na sua conta</CardTitle>
            <CardDescription className="text-center">Digite suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toggle entre tipos de login */}
            <div className="flex rounded-lg border p-1 mb-6">
              <Button
                type="button"
                variant={loginType === 'local' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setLoginType('local')}
                disabled={isLoading}
              >
                Login Local
              </Button>
              <Button
                type="button"
                variant={loginType === 'tagone' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setLoginType('tagone')}
                disabled={isLoading}
              >
                Login TagOne
              </Button>
            </div>

            {loginType === 'local' ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && <div className="text-sm text-red-600 dark:text-red-400 text-center">{error}</div>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
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
              </Form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = tagoneForm.getValues();
                  onTagOneSubmit(data);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Usuário TagOne
                  </label>
                  <Input
                    placeholder="seu.usuario.tagone"
                    value={tagoneForm.watch('username') || ''}
                    onChange={(e) => tagoneForm.setValue('username', e.target.value)}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Senha TagOne
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={tagoneForm.watch('password') || ''}
                    onChange={(e) => tagoneForm.setValue('password', e.target.value)}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                {error && <div className="text-sm text-red-600 dark:text-red-400 text-center">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar com TagOne'
                  )}
                </Button>
              </form>
            )}

            {loginType === 'local' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Não tem uma conta?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-primary"
                    onClick={() => router.push('/register')}
                  >
                    Criar conta
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Gestão MV. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
