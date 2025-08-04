import { Database } from '@/server/database/database';
import { users, userRoles, USER_ROLES } from '@/shared';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Função refatorada que aceita parâmetros
export async function criarUsuarioAdmin(db: Database, email: string, password: string, name: string = 'Administrador') {
  try {
    // Verificar se usuário admin já existe
    const existingAdmin = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingAdmin.length > 0) {
      throw new Error(`Usuário com email ${email} já existe no banco de dados`);
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário admin
    const [adminUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        isActive: true,
      })
      .returning();

    await db.insert(userRoles).values({
      userId: adminUser.id,
      role: USER_ROLES.ADMIN,
    });

    console.log(`✅ Usuário admin criado com sucesso: ${email}`);
    return adminUser;
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    throw error;
  }
}
