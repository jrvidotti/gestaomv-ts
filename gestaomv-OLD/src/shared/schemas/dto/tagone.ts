import { z } from 'zod';

export const tagoneLoginSchema = z.object({
  usuarioTagone: z.string().min(1, 'Usuário TagOne é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const tagoneStatusSchema = z.object({
  isConnected: z.boolean(),
  usuarioTagone: z.string().optional(),
  lastConnection: z.date().optional(),
});

export type TagoneLoginDto = z.infer<typeof tagoneLoginSchema>;
export type TagoneStatusDto = z.infer<typeof tagoneStatusSchema>;

export interface TagOneLoginResult {
  tagoneCookie: string;
  loggedClaims: Record<string, unknown>;
}

export interface TagOneUser {
  id: string;
  username: string;
  email: string;
  nome: string;
}
