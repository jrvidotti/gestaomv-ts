import type { Db } from "@/db";
import { userTagone, users } from "@/db/schemas";
import type { TagOneLoginResult, TagoneLoginDto } from "@/modules/core/dtos";
import { TagoneClient } from "@movelabs/tagone";
import { eq } from "drizzle-orm";

export class TagoneService {
  private _tagoneClient?: TagoneClient;

  constructor(
    private readonly db: Db,
    private readonly tagoneBaseUrl?: string
  ) {
    this._tagoneClient = this.tagoneBaseUrl
      ? new TagoneClient(this.tagoneBaseUrl)
      : undefined;
    if (!this._tagoneClient) {
      throw new Error("TagOne client não configurado");
    }
  }

  private get tagOneClient() {
    if (!this._tagoneClient) {
      throw new Error("TagOne client não configurado");
    }
    return this._tagoneClient;
  }

  async loginWithTagOne(
    username: string,
    password: string
  ): Promise<TagOneLoginResult | null> {
    try {
      const loggedClaims = await this.tagOneClient.doLogin(username, password);
      const tagoneCookie = this.tagOneClient.tagoneCookie;

      if (!tagoneCookie) {
        throw new Error("Falha ao obter cookie de autenticação");
      }

      return {
        tagoneCookie,
        loggedClaims,
      };
    } catch (error) {
      console.error("Erro ao realizar login TagOne: Login falhou");
      return null;
    }
  }

  async validateTagOneCookie(tagoneCookie: string): Promise<boolean> {
    try {
      this.tagOneClient.setCookie(tagoneCookie);

      const loggedClaims = await this.tagOneClient.getLoggedClaims();

      return !!loggedClaims;
    } catch (error) {
      console.error("Erro ao validar cookie TagOne: Cookie inválido");
      return false;
    }
  }

  async loginAndSaveTagOne(userId: number, loginData: TagoneLoginDto) {
    const loginResult = await this.loginWithTagOne(
      loginData.usuarioTagone,
      loginData.senha
    );

    if (!loginResult) {
      throw new Error("Falha ao fazer login no TagOne");
    }

    // Verificar se já existe um registro para este usuário
    const existingRecord = await this.db
      .select()
      .from(userTagone)
      .where(eq(userTagone.userId, userId))
      .limit(1);

    if (existingRecord.length > 0) {
      // Atualizar registro existente
      await this.db
        .update(userTagone)
        .set({
          usuarioTagone: loginData.usuarioTagone,
          tagoneCookie: loginResult.tagoneCookie,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userTagone.userId, userId));
    } else {
      // Criar novo registro
      await this.db.insert(userTagone).values({
        userId,
        usuarioTagone: loginData.usuarioTagone,
        tagoneCookie: loginResult.tagoneCookie,
      });
    }

    return {
      success: true,
      message: "Login TagOne realizado com sucesso",
    };
  }

  async getTagOneStatus(userId: number) {
    // Buscar dados do usuário para verificar o authProvider
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const userAuthProvider = user.length > 0 ? user[0].authProvider : null;

    const record = await this.db
      .select()
      .from(userTagone)
      .where(eq(userTagone.userId, userId))
      .limit(1);

    if (record.length === 0) {
      return {
        isConnected: false,
        usuarioTagone: undefined,
        lastConnection: undefined,
        isNativeTagoneUser: userAuthProvider === "tagone",
      };
    }

    const userRecord = record[0];

    // Se o usuário foi criado via TagOne (authProvider='tagone'), considerar sempre conectado
    if (userAuthProvider === "tagone") {
      return {
        isConnected: true,
        usuarioTagone: userRecord.usuarioTagone,
        lastConnection: userRecord.updatedAt,
        isNativeTagoneUser: true,
      };
    }

    // Para usuários normais, verificar se o cookie ainda é válido
    const isValid = userRecord.tagoneCookie
      ? await this.validateTagOneCookie(userRecord.tagoneCookie)
      : false;

    return {
      isConnected: isValid,
      usuarioTagone: userRecord.usuarioTagone,
      lastConnection: userRecord.updatedAt,
      isNativeTagoneUser: false,
    };
  }

  async logoutTagOne(userId: number) {
    const record = await this.db
      .select()
      .from(userTagone)
      .where(eq(userTagone.userId, userId))
      .limit(1);

    if (record.length > 0) {
      await this.db
        .update(userTagone)
        .set({
          tagoneCookie: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userTagone.userId, userId));
    }

    return {
      success: true,
      message: "Logout TagOne realizado com sucesso",
    };
  }

  async getUserTagOne(userId: number) {
    const record = await this.db
      .select()
      .from(userTagone)
      .where(eq(userTagone.userId, userId))
      .limit(1);
    return record.length > 0 ? record[0] : null;
  }
}
