import { db } from "@/db";
import { eq } from "drizzle-orm";
import type { ConfiguracoesSistemaDto } from "../dtos/configuracoes";
import { configuracoes } from "../schemas";
import type { Configuracao } from "../types";

export class ConfiguracoesService {
  async getSetting(key: string): Promise<Configuracao | undefined> {
    const result = await db
      .select()
      .from(configuracoes)
      .where(eq(configuracoes.key, key))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getSettingsByCategory(category: string): Promise<Configuracao[]> {
    return await db
      .select()
      .from(configuracoes)
      .where(eq(configuracoes.category, category));
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Configuracao> {
    const existingSetting = await this.getSetting(key);

    if (existingSetting) {
      // Atualizar configuração existente
      const [updated] = await db
        .update(configuracoes)
        .set({
          value,
          description: description || existingSetting.description,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(configuracoes.key, key))
        .returning();
      return updated;
    }
    // Criar nova configuração
    const [created] = await db
      .insert(configuracoes)
      .values({
        key,
        value,
        description,
        category: "system",
        isPublic: false,
      })
      .returning();
    return created;
  }

  async getConfiguracoesSistema(): Promise<ConfiguracoesSistemaDto> {
    const configuracoes = await this.getSettingsByCategory("system");

    // Criar objeto com valores padrão
    const result: ConfiguracoesSistemaDto = {
      allowUserRegistration: true,
      maintenanceMode: false,
      emailNotifications: true,
      notifyNewUsers: false,
      newUserNotificationAdmins: "",
      notifyUserApproval: true,
    };

    // Aplicar valores do banco de dados
    for (const config of configuracoes) {
      switch (config.key) {
        case "allowUserRegistration":
          result.allowUserRegistration = config.value === "true";
          break;
        case "maintenanceMode":
          result.maintenanceMode = config.value === "true";
          break;
        case "emailNotifications":
          result.emailNotifications = config.value === "true";
          break;
        case "notifyNewUsers":
          result.notifyNewUsers = config.value === "true";
          break;
        case "newUserNotificationAdmins":
          result.newUserNotificationAdmins = config.value;
          break;
        case "notifyUserApproval":
          result.notifyUserApproval = config.value === "true";
          break;
      }
    }

    return result;
  }

  async updateConfiguracoesSistema(
    configuracoes: Partial<ConfiguracoesSistemaDto>
  ): Promise<ConfiguracoesSistemaDto> {
    // Atualizar cada configuração
    for (const [key, value] of Object.entries(configuracoes)) {
      if (value !== undefined) {
        const stringValue =
          typeof value === "boolean" ? value.toString() : value.toString();
        await this.updateSetting(key, stringValue, this.getDescription(key));
      }
    }

    // Retornar configurações atualizadas
    return await this.getConfiguracoesSistema();
  }

  getDescription(key: string): string {
    const descriptions: Record<string, string> = {
      allowUserRegistration:
        "Permite que novos usuários se registrem no sistema",
      maintenanceMode: "Ativa o modo de manutenção do sistema",
      emailNotifications: "Habilita o envio de notificações por email",
      notifyNewUsers: "Envia notificação quando novos usuários se registram",
      newUserNotificationAdmins:
        "Lista de IDs de administradores que recebem notificações de novos usuários",
      notifyUserApproval:
        "Envia email de boas-vindas quando usuário é aprovado",
    };
    return descriptions[key] || "";
  }

  async initiacializarConfiguracoesPadrao(): Promise<void> {
    const defaultSettings = [
      { key: "allowUserRegistration", value: "true" },
      { key: "maintenanceMode", value: "false" },
      { key: "emailNotifications", value: "true" },
      { key: "notifyNewUsers", value: "false" },
      { key: "newUserNotificationAdmins", value: "" },
      { key: "notifyUserApproval", value: "true" },
    ];

    for (const setting of defaultSettings) {
      const existing = await this.getSetting(setting.key);
      if (!existing) {
        await this.updateSetting(
          setting.key,
          setting.value,
          this.getDescription(setting.key)
        );
      }
    }
  }
}
