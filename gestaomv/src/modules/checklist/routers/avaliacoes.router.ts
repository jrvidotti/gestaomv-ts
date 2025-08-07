import { ALL_ROLES } from "@/constants";
import { avaliacoesService } from "@/modules/checklist/services";
import {
	adminProcedure,
	createRoleProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import {
	comparativoUnidadesSchema,
	createAvaliacaoSchema,
	deleteAvaliacaoSchema,
	finalizarAvaliacaoSchema,
	getAvaliacaoSchema,
	listAvaliacoesSchema,
	relatorioAvaliacoesSchema,
	updateAvaliacaoSchema,
} from "../dtos/avaliacoes";

// Procedimento específico para avaliadores de checklist
const avaliadorChecklistProcedure = createRoleProcedure([
	ALL_ROLES.ADMIN,
	ALL_ROLES.CHECKLIST_AVALIADOR,
]);

export const avaliacoesRouter = createTRPCRouter({
	// Listar avaliações (protegido - filtrado por permissão)
	listar: protectedProcedure
		.input(listAvaliacoesSchema)
		.query(async ({ input, ctx }) => {
			// Se não for admin ou avaliador_checklist, filtrar apenas suas próprias avaliações
			const isAdminOrAvaliador = ctx.user.roles.some((role) =>
				[ALL_ROLES.ADMIN, ALL_ROLES.CHECKLIST_AVALIADOR].includes(role as any),
			);

			const filtros = isAdminOrAvaliador
				? input
				: { ...input, avaliadorId: ctx.user.id };

			return await avaliacoesService.listar(filtros);
		}),

	// Buscar avaliação por ID (protegido)
	buscar: protectedProcedure
		.input(getAvaliacaoSchema)
		.query(async ({ input, ctx }) => {
			const avaliacao = await avaliacoesService.buscar(input.id);

			if (!avaliacao) {
				throw new Error("Avaliação não encontrada");
			}

			// Verificar se usuário tem permissão para ver a avaliação
			const isAdminOrAvaliador = ctx.user.roles.some((role) =>
				[ALL_ROLES.ADMIN, ALL_ROLES.CHECKLIST_AVALIADOR].includes(role as any),
			);

			if (!isAdminOrAvaliador && avaliacao.avaliadorId !== ctx.user.id) {
				throw new Error("Acesso negado a esta avaliação");
			}

			return avaliacao;
		}),

	// Criar avaliação (avaliador_checklist ou admin)
	criar: avaliadorChecklistProcedure
		.input(createAvaliacaoSchema)
		.mutation(async ({ input, ctx }) => {
			return await avaliacoesService.criar(input, ctx.user.id);
		}),

	// Atualizar avaliação (apenas o próprio avaliador ou admin)
	atualizar: protectedProcedure
		.input(updateAvaliacaoSchema)
		.mutation(async ({ input, ctx }) => {
			// Primeiro, buscar a avaliação para verificar permissões
			const avaliacaoExistente = await avaliacoesService.buscar(input.id);

			if (!avaliacaoExistente) {
				throw new Error("Avaliação não encontrada");
			}

			// Verificar permissões
			const isAdmin = ctx.user.roles.includes(ALL_ROLES.ADMIN);
			const isOwner = avaliacaoExistente.avaliadorId === ctx.user.id;

			if (!isAdmin && !isOwner) {
				throw new Error("Acesso negado para editar esta avaliação");
			}

			const { id, ...data } = input;
			return await avaliacoesService.atualizar(id, data);
		}),

	// Finalizar avaliação (apenas o próprio avaliador ou admin)
	finalizar: protectedProcedure
		.input(finalizarAvaliacaoSchema)
		.mutation(async ({ input, ctx }) => {
			// Verificar permissões (mesmo que atualizar)
			const avaliacaoExistente = await avaliacoesService.buscar(input.id);

			if (!avaliacaoExistente) {
				throw new Error("Avaliação não encontrada");
			}

			const isAdmin = ctx.user.roles.includes(ALL_ROLES.ADMIN);
			const isOwner = avaliacaoExistente.avaliadorId === ctx.user.id;

			if (!isAdmin && !isOwner) {
				throw new Error("Acesso negado para finalizar esta avaliação");
			}

			const { id, ...data } = input;
			return await avaliacoesService.atualizar(id, {
				...data,
				status: "concluida",
			});
		}),

	// Deletar avaliação (admin)
	deletar: adminProcedure
		.input(deleteAvaliacaoSchema)
		.mutation(async ({ input }) => {
			const success = await avaliacoesService.deletar(input.id);

			if (!success) {
				throw new Error("Falha ao deletar avaliação");
			}

			return { success: true };
		}),

	// Gerar relatório (admin ou avaliador_checklist)
	gerarRelatorio: avaliadorChecklistProcedure
		.input(relatorioAvaliacoesSchema)
		.query(async ({ input }) => {
			return await avaliacoesService.gerarRelatorio(input);
		}),

	// Comparativo entre unidades (admin ou avaliador_checklist)
	gerarComparativo: avaliadorChecklistProcedure
		.input(comparativoUnidadesSchema)
		.query(async ({ input }) => {
			return await avaliacoesService.gerarComparativo(input);
		}),
});
