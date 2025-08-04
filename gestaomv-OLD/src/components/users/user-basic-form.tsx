'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, EyeOff, User } from 'lucide-react';

const userFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.union([z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'), z.string().length(0)]).optional(),
  isActive: z.boolean(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserBasicFormProps {
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function UserBasicForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: UserBasicFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    // Se estiver editando e senha estiver vazia, remover do objeto
    if (isEditing && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      await onSubmit(dataWithoutPassword as UserFormData);
    } else {
      await onSubmit(data);
    }
  };

  const watchedName = form.watch('name');
  const watchedEmail = form.watch('email');

  return (
    <Card className={className}>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" id="user-edit-form">
          {/* Avatar Preview */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={watchedEmail ? `https://avatar.vercel.sh/${watchedEmail}` : undefined} />
              <AvatarFallback className="text-lg">{watchedName ? watchedName[0]?.toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Foto do Perfil</h4>
              <p className="text-sm text-muted-foreground">Avatar gerado automaticamente baseado no email</p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" placeholder="Digite o nome completo" {...form.register('name')} />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Digite o email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">{isEditing ? 'Nova Senha (opcional)' : 'Senha'}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditing ? 'Deixe vazio para manter a senha atual' : 'Digite a senha'}
                {...form.register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
            {isEditing && <p className="text-sm text-muted-foreground">Deixe vazio para manter a senha atual</p>}
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Usuário ativo</Label>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
