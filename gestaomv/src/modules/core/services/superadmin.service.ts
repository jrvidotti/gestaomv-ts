import fs from "node:fs";
import path from "node:path";
import { USER_ROLES } from "@/constants";
import { db } from "@/db";
import { schema } from "@/db";
import { getDatabaseMigrations } from "@/db";
import { env } from "@/env";
import {
	cargosConfig,
	consultasCpfConfig,
	departamentosConfig,
	empresasConfig,
	equipesConfig,
	executaExportacao,
	executaImportacao,
	materiaisConfig,
	solicitacoesConfig,
	tiposMaterialConfig,
	unidadesConfig,
	unidadesMedidaConfig,
	usersConfig,
} from "@/lib/import-export";
import { count, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type {
	CreateAdminDTO,
	MigrationInfoDTO,
	MigrationStatusDTO,
	SeedOperationDTO,
	SystemInfoDTO,
	SystemStatsDTO,
} from "../dtos";
import { UsersService } from "./users.service";

interface AppliedMigration {
	hash: string;
	created_at: number;
}

interface JournalEntry {
	idx: number;
	version: string;
	when: number;
	tag: string;
	breakpoints: boolean;
}

interface Journal {
	version: string;
	dialect: string;
	entries: JournalEntry[];
}

export class SuperadminService {
	private usersService = new UsersService();

	async getSystemStats(): Promise<SystemStatsDTO> {
		try {
			const safeCount = async (table: any, tableName: string) => {
				try {
					const result = await db.select({ count: count() }).from(table);
					return result[0].count;
				} catch (error) {
					console.warn(`Tabela '${tableName}' não encontrada, retornando 0`);
					return 0;
				}
			};

			const [
				totalUsers,
				totalEmpresas,
				totalUnidades,
				totalFuncionarios,
				totalDepartamentos,
				totalEquipes,
				totalCargos,
				totalMateriais,
				totalSolicitacoes,
			] = await Promise.all([
				safeCount(schema.users, "users"),
				safeCount(schema.empresas, "empresas"),
				safeCount(schema.unidades, "unidades"),
				safeCount(schema.funcionarios, "funcionarios"),
				safeCount(schema.departamentos, "departamentos"),
				safeCount(schema.equipes, "equipes"),
				safeCount(schema.cargos, "cargos"),
				safeCount(schema.materiais, "materiais"),
				safeCount(schema.solicitacoesMaterial, "solicitacoes_material"),
			]);

			return {
				base: {
					users: totalUsers,
					empresas: totalEmpresas,
					unidades: totalUnidades,
				},
				rh: {
					funcionarios: totalFuncionarios,
					departamentos: totalDepartamentos,
					equipes: totalEquipes,
					cargos: totalCargos,
				},
				almoxarifado: {
					materiais: totalMateriais,
					solicitacoes: totalSolicitacoes,
				},
			};
		} catch (error) {
			console.error("Erro ao buscar estatísticas:", error);
			throw new Error("Erro ao buscar estatísticas do sistema");
		}
	}

	async getSystemInfo(): Promise<SystemInfoDTO> {
		try {
			const packageJsonPath = path.join(process.cwd(), "package.json");
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

			const databasePath = env.DATABASE_PATH.startsWith(".")
				? path.join(process.cwd(), env.DATABASE_PATH)
				: env.DATABASE_PATH;
			const databaseExists = fs.existsSync(databasePath);
			const databaseStats = databaseExists ? fs.statSync(databasePath) : null;

			return {
				application: {
					name: packageJson.name || "Gestão Corporativa",
					version: packageJson.version || "1.0.0",
					environment: env.NODE_ENV,
					nodeVersion: process.version,
				},
				database: {
					path: databasePath,
					exists: databaseExists,
					size: databaseStats
						? `${(databaseStats.size / 1024 / 1024).toFixed(2)} MB`
						: "N/A",
					lastModified: databaseStats
						? databaseStats.mtime.toISOString()
						: "N/A",
				},
				server: {
					port: 3000,
					uptime: `${Math.floor(process.uptime())} segundos`,
					memoryUsage: {
						rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
						heapTotal: `${Math.round(
							process.memoryUsage().heapTotal / 1024 / 1024,
						)} MB`,
						heapUsed: `${Math.round(
							process.memoryUsage().heapUsed / 1024 / 1024,
						)} MB`,
					},
				},
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Erro ao buscar informações do sistema:", error);
			throw new Error("Erro ao buscar informações do sistema");
		}
	}

	private async getAppliedMigrations(): Promise<AppliedMigration[]> {
		try {
			const result = await db.all(sql`
        SELECT hash, created_at 
        FROM __drizzle_migrations 
        ORDER BY created_at ASC
      `);
			return result as AppliedMigration[];
		} catch (error) {
			return [];
		}
	}

	private loadJournal(migrationsFolder: string): Journal | null {
		try {
			const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
			const journalContent = fs.readFileSync(journalPath, "utf8");
			return JSON.parse(journalContent) as Journal;
		} catch (error) {
			console.warn("Não foi possível carregar _journal.json:", error);
			return null;
		}
	}

	async getMigrationInfo(): Promise<MigrationInfoDTO> {
		try {
			const migrationsFolder = env.MIGRATIONS_PATH.startsWith(".")
				? path.join(process.cwd(), env.MIGRATIONS_PATH)
				: env.MIGRATIONS_PATH;

			const journal = this.loadJournal(migrationsFolder);
			if (!journal) {
				throw new Error("Não foi possível carregar o journal de migrações");
			}

			const appliedMigrations = await this.getAppliedMigrations();
			const appliedTimestamps = new Set(
				appliedMigrations.map((m) => m.created_at),
			);

			const migrationsStatus: MigrationStatusDTO[] = journal.entries.map(
				(entry) => {
					const filename = `${entry.tag}.sql`;
					const isApplied = appliedTimestamps.has(entry.when);

					return {
						filename,
						tag: entry.tag,
						when: entry.when,
						idx: entry.idx,
						status: isApplied ? "applied" : "pending",
						appliedAt: new Date(entry.when),
					};
				},
			);

			const summary = {
				total: journal.entries.length,
				applied: migrationsStatus.filter((m) => m.status === "applied").length,
				pending: migrationsStatus.filter((m) => m.status === "pending").length,
			};

			return {
				migrationFiles: journal.entries.map((entry) => `${entry.tag}.sql`),
				migrationsFolder,
				appliedMigrations,
				migrationsStatus,
				summary,
				journal,
				totalMigrations: journal.entries.length,
			};
		} catch (error) {
			console.error("Erro ao listar migrações:", error);
			throw new Error("Erro ao listar migrações");
		}
	}

	async runMigrations(): Promise<{ success: boolean; message: string }> {
		try {
			const migrationsFolder = env.MIGRATIONS_PATH.startsWith(".")
				? path.join(process.cwd(), env.MIGRATIONS_PATH)
				: env.MIGRATIONS_PATH;

			const migrationDb = getDatabaseMigrations();

			console.log("🔄 Aplicando migrações do Drizzle...");
			migrate(migrationDb, { migrationsFolder });
			console.log("✅ Migrações aplicadas com sucesso!");

			const hasUser = await db.query.users.findFirst();
			if (!hasUser)
				await this.usersService.create(
					{
						email: env.SUPERADMIN_EMAIL,
						password: env.SUPERADMIN_PASSWORD,
						name: "SuperAdmin",
						isActive: true,
					},
					[USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN],
				);

			return {
				success: true,
				message: `Migrações aplicadas com sucesso!${!hasUser ? " Superadmin criado com sucesso!" : ""}`,
			};
		} catch (error) {
			console.error("❌ Erro ao aplicar migrações:", error);
			throw new Error(
				`Erro ao aplicar migrações: ${
					error instanceof Error ? error.message : "Erro desconhecido"
				}`,
			);
		}
	}

	async seedOperation(operation: SeedOperationDTO["operation"]) {
		const configs = [
			usersConfig,
			tiposMaterialConfig,
			unidadesMedidaConfig,
			consultasCpfConfig,
			empresasConfig,
			unidadesConfig,
			departamentosConfig,
			equipesConfig,
			cargosConfig,
			materiaisConfig,
			solicitacoesConfig,
		];

		const resultados = [];
		const outputs: { timestamp: string; message: string }[] = [];

		if (operation === "export") {
			for (const config of configs) {
				try {
					const resultado = await executaExportacao(config as any);
					resultados.push(resultado);
					outputs.push({
						timestamp: resultado.timestamp || new Date().toISOString(),
						message: `${resultado.nomeArquivo} - ${resultado.exportados} exportados`,
					});
				} catch (error) {
					outputs.push({
						timestamp: new Date().toISOString(),
						message: `❌ Erro ao exportar ${config.nomeArquivo}: ${error}`,
					});
				}
			}

			const totalExportados = resultados.reduce(
				(acc, res) => acc + res.exportados,
				0,
			);
			outputs.push({
				timestamp: new Date().toISOString(),
				message: `✅ Exportação concluída com sucesso! Total de registros exportados: ${totalExportados}`,
			});
		} else {
			let arquivosNaoEncontrados = 0;

			for (const config of configs) {
				try {
					const resultado = await executaImportacao(config as any);
					resultados.push(resultado);

					if (resultado.arquivoEncontrado) {
						outputs.push({
							timestamp: resultado.timestamp || new Date().toISOString(),
							message: `${resultado.nomeArquivo} - ${resultado.importados} importados, ${resultado.ignorados} ignorados, ${resultado.erros} erros`,
						});
					} else {
						arquivosNaoEncontrados++;
						outputs.push({
							timestamp: resultado.timestamp || new Date().toISOString(),
							message: `⚠️ Arquivo não encontrado para importação: ${resultado.nomeArquivo}`,
						});
					}
				} catch (error) {
					outputs.push({
						timestamp: new Date().toISOString(),
						message: `❌ Erro ao importar ${config.nomeArquivo}: ${error}`,
					});
				}
			}

			const totalImportados = resultados.reduce(
				(acc, res) => acc + res.importados,
				0,
			);
			const totalIgnorados = resultados.reduce(
				(acc, res) => acc + res.ignorados,
				0,
			);
			const totalErros = resultados.reduce((acc, res) => acc + res.erros, 0);

			outputs.push({
				timestamp: new Date().toISOString(),
				message: "📊 Relatório Geral de Importação:",
			});
			outputs.push({
				timestamp: new Date().toISOString(),
				message: `✅ Total importados: ${totalImportados}`,
			});
			outputs.push({
				timestamp: new Date().toISOString(),
				message: `⏭️  Total ignorados: ${totalIgnorados}`,
			});
			outputs.push({
				timestamp: new Date().toISOString(),
				message: `❌ Total erros: ${totalErros}`,
			});
			outputs.push({
				timestamp: new Date().toISOString(),
				message: `⚠️ Total arquivos não encontrados: ${arquivosNaoEncontrados}`,
			});

			if (totalErros === 0) {
				outputs.push({
					timestamp: new Date().toISOString(),
					message: "✅ Importação concluída com sucesso!",
				});
			} else {
				outputs.push({
					timestamp: new Date().toISOString(),
					message:
						"⚠️ Importação concluída com ressalvas. Verifique os erros acima.",
				});
			}
		}

		return {
			success: true,
			operation,
			outputs,
		};
	}

	async createAdmin(data: CreateAdminDTO) {
		try {
			const adminUser = await this.usersService.create(
				{
					email: data.email,
					password: data.password,
					name: data.name,
					isActive: true,
				},
				["admin"],
			);

			return {
				success: true,
				message: "Administrador criado com sucesso!",
				user: {
					id: adminUser.id,
					email: adminUser.email,
					name: adminUser.name,
				},
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Erro ao criar administrador:", error);
			throw new Error(
				`Erro ao criar administrador: ${
					error instanceof Error ? error.message : "Erro desconhecido"
				}`,
			);
		}
	}
}

export const superadminService = new SuperadminService();
