import { Context } from './trpc.service';
import jwt from 'jsonwebtoken';
import { initializeDatabase } from '../database/database';
import { UserRoleType } from '@/shared';

export const createTRPCContext = async (req: Request): Promise<Context> => {
  // Garantir que o banco está inicializado
  initializeDatabase();

  const authorization = req.headers.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { user: undefined };
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: number;
      email: string;
      roles: UserRoleType[];
    };

    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles || [],
      },
    };
  } catch (error) {
    console.error('[Context] Erro ao verificar token:', error);
    return { user: undefined };
  }
};
