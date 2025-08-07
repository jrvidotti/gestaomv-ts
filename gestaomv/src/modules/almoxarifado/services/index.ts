import { db } from "@/db";
import { notificationsService, storageService } from "@/modules/core/services";
import { EstatisticasService } from "./estatisticas.service";
import { MateriaisService } from "./materiais.service";
import { SolicitacoesService } from "./solicitacoes.service";

export const materiaisService = new MateriaisService(db, storageService);
export const solicitacoesService = new SolicitacoesService(
	db,
	notificationsService,
);
export const estatisticasService = new EstatisticasService(db);
