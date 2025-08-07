import type { Db } from "@/db";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import type { Periodicidade, TipoItemChecklist } from "../enums";
import { checklistItems, checklistTemplates } from "../schemas";
import type {
	ChecklistItem,
	ChecklistTemplate,
	CreateChecklistTemplateData,
	RespostaPaginada,
} from "../types";

export class TemplatesService {
	constructor(private db: Db) {}
	// Criar template com itens
	async criar(
		data: CreateChecklistTemplateData,
		criadoPorId: number,
	): Promise<ChecklistTemplate> {
		const created = await this.db.transaction(async (tx) => {
			// Criar template
			const [template] = await tx
				.insert(checklistTemplates)
				.values({
					nome: data.nome,
					descricao: data.descricao,
					periodicidade: data.periodicidade,
					ativo: data.ativo,
					criadoPorId,
				})
				.returning();

			// Criar itens
			if (data.itens && data.itens.length > 0) {
				await tx.insert(checklistItems).values(
					data.itens.map((item) => ({
						templateId: template.id,
						titulo: item.titulo,
						descricao: item.descricao,
						tipo: item.tipo,
						obrigatorio: item.obrigatorio,
						peso: item.peso,
						ordem: item.ordem,
					})),
				);
			}

			return template;
		});

		const template = await this.buscar(created.id);
		if (!template) throw new Error("Erro ao criar template");
		return template;
	}

	// Listar templates com filtros
	async listar(filtros: {
		nome?: string;
		ativo?: boolean;
		periodicidade?: Periodicidade;
		pagina?: number;
		limite?: number;
	}): Promise<RespostaPaginada<ChecklistTemplate>> {
		const { nome, ativo, periodicidade, pagina = 1, limite = 20 } = filtros;

		// Aplicar filtros
		const conditions = [];
		if (nome) {
			conditions.push(ilike(checklistTemplates.nome, `%${nome}%`));
		}
		if (ativo !== undefined) {
			conditions.push(eq(checklistTemplates.ativo, ativo));
		}
		if (periodicidade) {
			conditions.push(eq(checklistTemplates.periodicidade, periodicidade));
		}

		// Ordenação e paginação
		const templates = await this.db.query.checklistTemplates.findMany({
			where: conditions.length > 0 ? and(...conditions) : undefined,
			with: {
				itens: true,
				criadoPor: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				avaliacoes: {
					columns: {
						id: true,
					},
				},
			},
			orderBy: desc(checklistTemplates.criadoEm),
			limit: limite,
			offset: (pagina - 1) * limite,
		});

		// Contar total para paginação
		const [{ count }] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(checklistTemplates)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		return {
			data: templates.map((template) => ({
				...template,
				avaliacoes: undefined,
				_count: {
					itens: template.itens.length,
					avaliacoes: template.avaliacoes.length,
				},
			})),
			total: count,
			pagina,
			limite,
			totalPaginas: Math.ceil(count / limite),
		};
	}

	// Buscar template por ID com itens
	async buscar(id: number): Promise<ChecklistTemplate | null> {
		const template = await this.db.query.checklistTemplates.findFirst({
			where: eq(checklistTemplates.id, id),
			with: {
				itens: true,
				criadoPor: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return template || null;
	}

	// Atualizar template
	async atualizar(
		id: number,
		data: Partial<CreateChecklistTemplateData>,
	): Promise<ChecklistTemplate | null> {
		await this.db
			.update(checklistTemplates)
			.set({
				nome: data.nome,
				descricao: data.descricao,
				periodicidade: data.periodicidade,
				ativo: data.ativo,
				atualizadoEm: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(checklistTemplates.id, id));

		return await this.buscar(id);
	}

	// Deletar template (soft delete)
	async deletar(id: number): Promise<boolean> {
		await this.db
			.update(checklistTemplates)
			.set({
				ativo: false,
				atualizadoEm: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(checklistTemplates.id, id));

		return true;
	}

	// Adicionar item ao template
	async adicionarItem(
		templateId: number,
		itemData: {
			titulo: string;
			descricao?: string;
			tipo: TipoItemChecklist;
			obrigatorio: boolean;
			peso: number;
		},
	): Promise<ChecklistItem> {
		// Buscar próxima ordem
		const ultimaOrdem = await this.db
			.select({ maxOrdem: sql<number>`max(${checklistItems.ordem})` })
			.from(checklistItems)
			.where(eq(checklistItems.templateId, templateId));

		const proximaOrdem = (ultimaOrdem[0]?.maxOrdem || 0) + 1;

		const [item] = await this.db
			.insert(checklistItems)
			.values({
				templateId,
				titulo: itemData.titulo,
				descricao: itemData.descricao,
				tipo: itemData.tipo,
				obrigatorio: itemData.obrigatorio,
				peso: itemData.peso,
				ordem: proximaOrdem,
			})
			.returning();

		return item;
	}

	// Atualizar item
	async atualizarItem(
		itemId: number,
		data: Partial<{
			titulo: string;
			descricao?: string;
			tipo: TipoItemChecklist;
			obrigatorio: boolean;
			peso: number;
			ordem: number;
		}>,
	): Promise<ChecklistItem | null> {
		const [updated] = await this.db
			.update(checklistItems)
			.set({
				...data,
				atualizadoEm: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(checklistItems.id, itemId))
			.returning();

		return updated || null;
	}

	// Deletar item (soft delete)
	async deletarItem(itemId: number): Promise<boolean> {
		const [deleted] = await this.db
			.update(checklistItems)
			.set({
				ativo: false,
				atualizadoEm: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(checklistItems.id, itemId))
			.returning();

		return !!deleted;
	}

	// Reordenar itens
	async reordenarItens(
		templateId: number,
		itens: Array<{ id: number; ordem: number }>,
	): Promise<boolean> {
		return await this.db.transaction(async (tx) => {
			for (const item of itens) {
				await tx
					.update(checklistItems)
					.set({
						ordem: item.ordem,
						atualizadoEm: sql`CURRENT_TIMESTAMP`,
					})
					.where(
						and(
							eq(checklistItems.id, item.id),
							eq(checklistItems.templateId, templateId),
						),
					);
			}
			return true;
		});
	}
}
