import {
	atenderSolicitacaoSchema,
	atualizarSolicitacaoSchema,
	criarSolicitacaoMaterialSchema,
	filtroSolicitacoesSchema,
} from "@/modules/almoxarifado/dtos";
import { solicitacoesService } from "@/modules/almoxarifado/services/solicitacoes.service";
import { USER_ROLES } from "@/modules/core/enums";
import { createRoleProcedure, protectedProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

// Procedures específicos por role
const aprovadorProcedure = createRoleProcedure([
	USER_ROLES.ADMIN,
	USER_ROLES.APROVADOR_ALMOXARIFADO,
]);
const gestorAlmoxarifadoProcedure = createRoleProcedure([
	USER_ROLES.ADMIN,
	USER_ROLES.APROVADOR_ALMOXARIFADO,
	USER_ROLES.GERENCIA_ALMOXARIFADO,
]);
const gerenteAlmoxarifadoProcedure = createRoleProcedure([
	USER_ROLES.GERENCIA_ALMOXARIFADO,
]);

export const solicitacoesRouter = {
	criar: protectedProcedure
		.input(criarSolicitacaoMaterialSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user?.id;
			if (!userId) {
				throw new Error("Usuário não autenticado");
			}
			return await solicitacoesService.criarSolicitacaoMaterial(userId, input);
		}),

	listar: protectedProcedure
		.input(filtroSolicitacoesSchema)
		.query(async ({ input, ctx }) => {
			// Usuários podem ver apenas suas próprias solicitações, admins podem ver todas
			const filtros = {
				...input,
				pagina: input.pagina ?? 1,
				limite: input.limite ?? 20,
			};

			// Se não é admin, mostrar apenas suas próprias solicitações
			if (
				!ctx.user?.roles?.includes(USER_ROLES.ADMIN) &&
				!ctx.user?.roles?.includes("gerencia_almoxarifado")
			) {
				filtros.solicitanteId = ctx.user?.id;
			}

			return await solicitacoesService.listarSolicitacoesMaterial(filtros);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const solicitacao =
				await solicitacoesService.buscarSolicitacaoMaterialPorId(input.id);
			if (!solicitacao) {
				throw new Error("Solicitação não encontrada");
			}

			// Verificar se o usuário pode ver essa solicitação
			const isOwner = solicitacao.solicitanteId === ctx.user?.id;
			const isAdmin =
				ctx.user?.roles?.includes(USER_ROLES.ADMIN) ||
				ctx.user?.roles?.includes("gerencia_almoxarifado");

			if (!isOwner && !isAdmin) {
				throw new Error("Acesso negado");
			}

			return solicitacao;
		}),

	aprovarOuRejeitar: aprovadorProcedure
		.input(
			z.object({
				id: z.number(),
				data: atualizarSolicitacaoSchema,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user?.id;
			if (!userId) {
				throw new Error("Usuário não autenticado");
			}

			const dadosAprovacao = {
				...input.data,
				aprovadorId: userId,
			};

			const solicitacao =
				await solicitacoesService.aprovarOuRejeitarSolicitacao(
					input.id,
					dadosAprovacao,
				);
			if (!solicitacao) {
				throw new Error("Solicitação não encontrada");
			}

			return solicitacao;
		}),

	atender: gestorAlmoxarifadoProcedure
		.input(
			z.object({
				id: z.number(),
				data: atenderSolicitacaoSchema,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user?.id;
			if (!userId) {
				throw new Error("Usuário não autenticado");
			}

			const dadosAtendimento = {
				...input.data,
				atendidoPorId: userId,
			};

			const solicitacao = await solicitacoesService.atenderSolicitacao(
				input.id,
				dadosAtendimento,
			);
			if (!solicitacao) {
				throw new Error("Solicitação não encontrada");
			}

			return solicitacao;
		}),

	cancelar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user?.id;
			if (!userId) {
				throw new Error("Usuário não autenticado");
			}

			const solicitacao = await solicitacoesService.cancelarSolicitacao(
				input.id,
				userId,
			);
			if (!solicitacao) {
				throw new Error("Solicitação não encontrada ou não pode ser cancelada");
			}

			return solicitacao;
		}),

	atualizarQtdAtendidaAprovador: aprovadorProcedure
		.input(
			z.object({
				itemId: z.number(),
				qtdAtendida: z.number().min(0),
			}),
		)
		.mutation(async ({ input }) => {
			return await solicitacoesService.atualizarQtdAtendida(
				input.itemId,
				input.qtdAtendida,
				true,
			);
		}),

	atualizarQtdAtendidaGerente: gerenteAlmoxarifadoProcedure
		.input(
			z.object({
				itemId: z.number(),
				qtdAtendida: z.number().min(0),
			}),
		)
		.mutation(async ({ input }) => {
			return await solicitacoesService.atualizarQtdAtendida(
				input.itemId,
				input.qtdAtendida,
				false,
			);
		}),
} satisfies TRPCRouterRecord;
