import { z } from "zod";
import {
	createEmpresaSchema,
	createUnidadeSchema,
	createUserSchema,
	updateConfiguracoesSistemaSchema,
	updateEmpresaSchema,
	updateUnidadeSchema,
	updateUserSchema,
} from "./dtos";
import type { ConfiguracoesService } from "./services/configuracoes.service";
import type { EmpresasService } from "./services/empresas.service";
import type { UnidadesService } from "./services/unidades.service";
import type { UsersService } from "./services/users.service";

export class BaseRouter {
	constructor(
		private readonly usersService: UsersService,
		private readonly empresasService: EmpresasService,
		private readonly unidadesService: UnidadesService,
		private readonly configuracoesService: ConfiguracoesService,
	) {}

	createRouter() {
		return this.trpcService.router({
			// ============ USERS ============
			users: this.trpcService.router({
				findAll: this.trpcService.adminProcedure.query(async () => {
					const users = await this.usersService.findAll();
					return users.map(({ password, ...user }) => user);
				}),

				findOne: this.trpcService.adminProcedure
					.input(z.object({ id: z.number() }))
					.query(async ({ input }) => {
						const user = await this.usersService.findOne(input.id);
						if (!user) {
							throw new Error("Usuário não encontrado");
						}
						const { password, ...userWithoutPassword } = user;
						return userWithoutPassword;
					}),

				create: this.trpcService.adminProcedure
					.input(createUserSchema)
					.mutation(async ({ input }) => {
						const user = await this.usersService.create(input);
						const { password, ...userWithoutPassword } = user;
						return userWithoutPassword;
					}),

				update: this.trpcService.adminProcedure
					.input(
						z.object({
							id: z.number(),
							data: updateUserSchema,
						}),
					)
					.mutation(async ({ input }) => {
						const { roles, ...userData } = input.data;
						const user = await this.usersService.update(
							input.id,
							userData,
							roles,
						);
						if (!user) {
							throw new Error("Usuário não encontrado");
						}
						const { password, ...userWithoutPassword } = user;
						return userWithoutPassword;
					}),

				remove: this.trpcService.adminProcedure
					.input(z.object({ id: z.number() }))
					.mutation(async ({ input }) => {
						await this.usersService.remove(input.id);
						return { message: "Usuário removido com sucesso" };
					}),

				findPendingUsers: this.trpcService.adminProcedure.query(async () => {
					const pendingUsers = await this.usersService.findPendingUsers();
					return pendingUsers.map(({ password, ...user }) => user);
				}),

				getUserStats: this.trpcService.adminProcedure.query(async () => {
					return await this.usersService.getUserStats();
				}),
			}),

			// ============ EMPRESAS ============
			empresas: this.trpcService.router({
				findAll: this.trpcService.adminProcedure.query(async () => {
					return await this.empresasService.findAll();
				}),

				findOne: this.trpcService.adminProcedure
					.input(z.object({ id: z.number() }))
					.query(async ({ input }) => {
						const empresa = await this.empresasService.findOne(input.id);
						if (!empresa) {
							throw new Error("Empresa não encontrada");
						}
						return empresa;
					}),

				findByCnpj: this.trpcService.adminProcedure
					.input(z.object({ cnpj: z.string() }))
					.query(async ({ input }) => {
						const empresa = await this.empresasService.findByCnpj(input.cnpj);
						if (!empresa) {
							throw new Error("Empresa não encontrada");
						}
						return empresa;
					}),

				findByPontowebId: this.trpcService.adminProcedure
					.input(z.object({ pontowebId: z.number() }))
					.query(async ({ input }) => {
						const empresa = await this.empresasService.findByPontowebId(
							input.pontowebId,
						);
						if (!empresa) {
							throw new Error("Empresa não encontrada");
						}
						return empresa;
					}),

				create: this.trpcService.adminProcedure
					.input(createEmpresaSchema)
					.mutation(async ({ input }) => {
						const empresaExistente = await this.empresasService.findByCnpj(
							input.cnpj,
						);
						if (empresaExistente) {
							throw new Error("CNPJ já cadastrado no sistema");
						}
						return await this.empresasService.create(input);
					}),

				update: this.trpcService.adminProcedure
					.input(
						z.object({
							id: z.number(),
							data: updateEmpresaSchema,
						}),
					)
					.mutation(async ({ input }) => {
						if (input.data.cnpj) {
							const empresaExistente = await this.empresasService.findByCnpj(
								input.data.cnpj,
							);
							if (empresaExistente && empresaExistente.id !== input.id) {
								throw new Error("CNPJ já cadastrado no sistema");
							}
						}

						const empresa = await this.empresasService.update(
							input.id,
							input.data,
						);
						if (!empresa) {
							throw new Error("Empresa não encontrada");
						}
						return empresa;
					}),

				remove: this.trpcService.adminProcedure
					.input(z.object({ id: z.number() }))
					.mutation(async ({ input }) => {
						const empresa = await this.empresasService.findOne(input.id);
						if (!empresa) {
							throw new Error("Empresa não encontrada");
						}

						if (empresa.unidades && empresa.unidades.length > 0) {
							throw new Error(
								`Não é possível excluir a empresa pois ela possui ${empresa.unidades.length} unidade(s) vinculada(s)`,
							);
						}

						await this.empresasService.remove(input.id);
						return { message: "Empresa removida com sucesso" };
					}),
			}),

			// ============ UNIDADES ============
			unidades: this.trpcService.router({
				findAll: this.trpcService.adminProcedure.query(async () => {
					return await this.unidadesService.findAll();
				}),

				findOne: this.trpcService.adminProcedure
					.input(z.object({ id: z.number() }))
					.query(async ({ input }) => {
						const unidade = await this.unidadesService.findOne(input.id);
						if (!unidade) {
							throw new Error("Unidade não encontrada");
						}
						return unidade;
					}),

				findByCodigo: this.trpcService.adminProcedure
					.input(z.object({ codigo: z.number() }))
					.query(async ({ input }) => {
						const unidade = await this.unidadesService.findByCodigo(
							input.codigo,
						);
						if (!unidade) {
							throw new Error("Unidade não encontrada");
						}
						return unidade;
					}),

				findByEmpresa: this.trpcService.adminProcedure
					.input(z.object({ empresaId: z.number() }))
					.query(async ({ input }) => {
						return await this.unidadesService.findByEmpresa(input.empresaId);
					}),

				create: this.trpcService.adminProcedure
					.input(createUnidadeSchema)
					.mutation(async ({ input }) => {
						return await this.unidadesService.create(input);
					}),

				update: this.trpcService.adminProcedure
					.input(
						z.object({
							id: z.number(),
							data: updateUnidadeSchema,
						}),
					)
					.mutation(async ({ input }) => {
						const unidade = await this.unidadesService.update(
							input.id,
							input.data,
						);
						if (!unidade) {
							throw new Error("Unidade não encontrada");
						}
						return unidade;
					}),

				remove: this.trpcService.adminProcedure
					.input(z.object({ id: z.number() }))
					.mutation(async ({ input }) => {
						await this.unidadesService.remove(input.id);
						return { message: "Unidade removida com sucesso" };
					}),
			}),

			// ============ CONFIGURAÇÕES ============
			configuracoes: this.trpcService.router({
				getConfiguracoesSistema: this.trpcService.adminProcedure.query(
					async () => {
						return await this.configuracoesService.getConfiguracoesSistema();
					},
				),

				updateConfiguracoesSistema: this.trpcService.adminProcedure
					.input(updateConfiguracoesSistemaSchema)
					.mutation(async ({ input }) => {
						return await this.configuracoesService.updateConfiguracoesSistema(
							input,
						);
					}),

				initializeDefaultSettings: this.trpcService.adminProcedure.mutation(
					async () => {
						await this.configuracoesService.initializeDefaultSettings();
						return {
							message: "Configurações padrão inicializadas com sucesso",
						};
					},
				),
			}),
		});
	}
}

// Export para compatibilidade com código existente
export const baseRouter = {
	users: {},
	empresas: {},
	unidades: {},
	configuracoes: {},
};
