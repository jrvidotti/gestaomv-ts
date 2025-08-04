'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/trpc';
import { Link, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function TagOneIntegration() {
  const {
    data: tagoneStatus,
    isLoading: isLoadingTagone,
    refetch: refetchTagoneStatus,
  } = api.tagone.getStatus.useQuery();
  const { data: userTagone, refetch: refetchUserTagone } = api.tagone.getUserTagOne.useQuery();

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ usuarioTagone: '', senha: '' });

  const tagoneLoginMutation = api.tagone.login.useMutation({
    onSuccess: () => {
      toast.success('Login TagOne realizado com sucesso!');
      setShowLoginForm(false);
      setLoginData({ usuarioTagone: '', senha: '' });
      refetchTagoneStatus();
      refetchUserTagone();
    },
    onError: (error) => {
      toast.error(`Erro ao fazer login: ${error.message}`);
    },
  });

  const tagoneLogoutMutation = api.tagone.logout.useMutation({
    onSuccess: () => {
      toast.success('Logout TagOne realizado com sucesso!');
      refetchTagoneStatus();
      refetchUserTagone();
    },
    onError: (error) => {
      toast.error(`Erro ao fazer logout: ${error.message}`);
    },
  });

  const handleTagoneLogin = () => {
    if (!loginData.usuarioTagone || !loginData.senha) {
      toast.error('Preencha todos os campos');
      return;
    }
    tagoneLoginMutation.mutate(loginData);
  };

  const handleTagoneLogout = () => {
    tagoneLogoutMutation.mutate();
  };

  const handleCancelLogin = () => {
    setShowLoginForm(false);
    setLoginData({ usuarioTagone: userTagone?.usuarioTagone || '', senha: '' });
  };

  // Preencher usuário TagOne se existir
  if (userTagone && !loginData.usuarioTagone && !showLoginForm) {
    setLoginData((prev) => ({ ...prev, usuarioTagone: userTagone.usuarioTagone }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Integração TagOne
        </CardTitle>
        <CardDescription>Conecte sua conta TagOne para sincronização</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingTagone ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status de Conexão</h4>
                <div className="flex items-center gap-2 mt-1">
                  {tagoneStatus?.isConnected ? (
                    <>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {tagoneStatus.isNativeTagoneUser ? 'TagOne Nativo' : 'Conectado'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Usuário: {tagoneStatus.usuarioTagone}</span>
                      {tagoneStatus.isNativeTagoneUser && (
                        <span className="text-xs text-blue-600">(Conta criada via TagOne)</span>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Desconectado
                    </Badge>
                  )}
                </div>
              </div>

              {tagoneStatus?.isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTagoneLogout}
                  disabled={tagoneLogoutMutation.isPending || tagoneStatus?.isNativeTagoneUser}
                  title={
                    tagoneStatus?.isNativeTagoneUser ? 'Usuários nativos do TagOne não podem desconectar' : undefined
                  }
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {tagoneLogoutMutation.isPending ? 'Desconectando...' : 'Desconectar'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowLoginForm(!showLoginForm)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {showLoginForm ? 'Cancelar' : 'Conectar'}
                </Button>
              )}
            </div>

            {tagoneStatus?.lastConnection && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Última Conexão</h4>
                <p className="text-sm">
                  {new Date(tagoneStatus.lastConnection).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {showLoginForm && (
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="text-sm font-medium">Conectar ao TagOne</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="usuarioTagone">Usuário TagOne</Label>
                    <Input
                      id="usuarioTagone"
                      value={loginData.usuarioTagone}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, usuarioTagone: e.target.value }))}
                      placeholder="Digite seu usuário TagOne"
                      disabled={tagoneLoginMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={loginData.senha}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, senha: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleTagoneLogin()}
                      placeholder="Digite sua senha"
                      disabled={tagoneLoginMutation.isPending}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleTagoneLogin} disabled={tagoneLoginMutation.isPending} size="sm">
                    {tagoneLoginMutation.isPending ? 'Conectando...' : 'Conectar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelLogin}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
