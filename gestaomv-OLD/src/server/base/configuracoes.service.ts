import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../database/database';
import { settings, type Setting, type NewSetting } from '@/shared';

export interface ConfiguracaoSistema {
  allowUserRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  notifyNewUsers: boolean;
  newUserNotificationAdmins: string; // IDs separados por vírgula
  notifyUserApproval: boolean;
}

@Injectable()
export class ConfiguracoesService {
  private get db() {
    return getDatabase();
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await this.db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return await this.db.select().from(settings).where(eq(settings.category, category));
  }

  async updateSetting(key: string, value: string, description?: string): Promise<Setting> {
    const existingSetting = await this.getSetting(key);

    if (existingSetting) {
      // Atualizar configuração existente
      const [updated] = await this.db
        .update(settings)
        .set({
          value,
          description: description || existingSetting.description,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      // Criar nova configuração
      const [created] = await this.db
        .insert(settings)
        .values({
          key,
          value,
          description,
          category: 'system',
          isPublic: false,
        })
        .returning();
      return created;
    }
  }

  async getConfiguracoesSistema(): Promise<ConfiguracaoSistema> {
    const configuracoes = await this.getSettingsByCategory('system');

    // Criar objeto com valores padrão
    const result: ConfiguracaoSistema = {
      allowUserRegistration: true,
      maintenanceMode: false,
      emailNotifications: true,
      notifyNewUsers: false,
      newUserNotificationAdmins: '',
      notifyUserApproval: true,
    };

    // Aplicar valores do banco de dados
    configuracoes.forEach((config) => {
      switch (config.key) {
        case 'allowUserRegistration':
          result.allowUserRegistration = config.value === 'true';
          break;
        case 'maintenanceMode':
          result.maintenanceMode = config.value === 'true';
          break;
        case 'emailNotifications':
          result.emailNotifications = config.value === 'true';
          break;
        case 'notifyNewUsers':
          result.notifyNewUsers = config.value === 'true';
          break;
        case 'newUserNotificationAdmins':
          result.newUserNotificationAdmins = config.value;
          break;
        case 'notifyUserApproval':
          result.notifyUserApproval = config.value === 'true';
          break;
      }
    });

    return result;
  }

  async updateConfiguracoesSistema(configuracoes: Partial<ConfiguracaoSistema>): Promise<ConfiguracaoSistema> {
    // Atualizar cada configuração
    for (const [key, value] of Object.entries(configuracoes)) {
      if (value !== undefined) {
        const stringValue = typeof value === 'boolean' ? value.toString() : value.toString();
        await this.updateSetting(key, stringValue, this.getDescription(key));
      }
    }

    // Retornar configurações atualizadas
    return await this.getConfiguracoesSistema();
  }

  private getDescription(key: string): string {
    const descriptions: Record<string, string> = {
      allowUserRegistration: 'Permite que novos usuários se registrem no sistema',
      maintenanceMode: 'Ativa o modo de manutenção do sistema',
      emailNotifications: 'Habilita o envio de notificações por email',
      notifyNewUsers: 'Envia notificação quando novos usuários se registram',
      newUserNotificationAdmins: 'Lista de IDs de administradores que recebem notificações de novos usuários',
      notifyUserApproval: 'Envia email de boas-vindas quando usuário é aprovado',
    };
    return descriptions[key] || '';
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      { key: 'allowUserRegistration', value: 'true' },
      { key: 'maintenanceMode', value: 'false' },
      { key: 'emailNotifications', value: 'true' },
      { key: 'notifyNewUsers', value: 'false' },
      { key: 'newUserNotificationAdmins', value: '' },
      { key: 'notifyUserApproval', value: 'true' },
    ];

    for (const setting of defaultSettings) {
      const existing = await this.getSetting(setting.key);
      if (!existing) {
        await this.updateSetting(setting.key, setting.value, this.getDescription(setting.key));
      }
    }
  }
}
