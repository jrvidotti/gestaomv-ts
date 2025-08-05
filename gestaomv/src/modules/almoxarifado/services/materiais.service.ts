import { db } from "@/db";
import { materiais, tiposMaterial, unidadesMedida } from "@/db/schemas";
import type {
	AtualizarMaterialData,
	CriarMaterialData,
	FiltrosMateriais,
} from "@/modules/almoxarifado/dtos";
import { storageService } from "@/modules/core/services/storage.service";
import { and, count, eq, sql } from "drizzle-orm";

export class MateriaisService {
	async listarTiposMaterial() {
		return await db.select().from(tiposMaterial);
	}

	async listarUnidadesMedida() {
		return await db.select().from(unidadesMedida);
	}

	async criarMaterial(materialData: CriarMaterialData) {
		const [material] = await db
			.insert(materiais)
			.values({
				...materialData,
				unidadeMedidaId: materialData.unidadeMedidaId || "UN",
				ativo: true,
			})
			.returning({ id: materiais.id });

		return await this.buscarMaterialPorId(material.id);
	}

	async listarMateriais(filtros?: FiltrosMateriais) {
		const { busca, tipoMaterialId, pagina = 1, limite = 20 } = filtros || {};
		const offset = (pagina - 1) * limite;

		const condicoes: ReturnType<typeof sql | typeof eq>[] = [];

		if (busca) {
			condicoes.push(
				sql`${materiais.nome} LIKE ${`%${busca}%`} OR ${materiais.descricao} LIKE ${`%${busca}%`}`,
			);
		}

		if (tipoMaterialId) {
			condicoes.push(eq(materiais.tipoMaterialId, tipoMaterialId));
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const materiaisList = await db.query.materiais.findMany({
			where: whereClause,
			with: {
				tipoMaterial: true,
				unidadeMedida: true,
			},
			orderBy: (materiais, { asc }) => [asc(materiais.nome)],
			limit: limite,
			offset: offset,
		});

		const [{ total }] = await db
			.select({ total: count() })
			.from(materiais)
			.where(whereClause);

		return {
			materiais: materiaisList,
			total: Number(total),
		};
	}

	async buscarMaterialPorId(id: number) {
		const material = await db.query.materiais.findFirst({
			where: eq(materiais.id, id),
			with: {
				tipoMaterial: true,
				unidadeMedida: true,
			},
		});

		return material;
	}

	async atualizarMaterial(id: number, materialData: AtualizarMaterialData) {
		const dadosAtualizacao = {
			...materialData,
			atualizadoEm: new Date().toISOString(),
		};

		await db
			.update(materiais)
			.set(dadosAtualizacao)
			.where(eq(materiais.id, id));

		return await this.buscarMaterialPorId(id);
	}

	async inativarMaterial(id: number): Promise<void> {
		await db
			.update(materiais)
			.set({
				ativo: false,
				atualizadoEm: new Date().toISOString(),
			})
			.where(eq(materiais.id, id));
	}

	async deletarFotoMaterial(
		materialId: number,
		urlFoto: string,
	): Promise<void> {
		// Verificar se o material existe
		const material = await this.buscarMaterialPorId(materialId);
		if (!material) {
			throw new Error("Material não encontrado");
		}

		// Verificar se a URL da foto corresponde à foto atual do material
		if (material.foto !== urlFoto) {
			throw new Error("URL da foto não corresponde à foto atual do material");
		}

		try {
			// Deletar arquivo do storage se o serviço estiver configurado
			if (storageService.isConfigurado()) {
				await storageService.deletarArquivo(urlFoto);
			}
		} catch (error) {
			// Log do erro mas não falha a operação se o arquivo não for encontrado no storage
			console.warn("Erro ao deletar arquivo do storage:", error);
		}

		// Remover URL da foto do material no banco de dados
		await db
			.update(materiais)
			.set({
				foto: null,
				atualizadoEm: new Date().toISOString(),
			})
			.where(eq(materiais.id, materialId));
	}
}

export const materiaisService = new MateriaisService();
