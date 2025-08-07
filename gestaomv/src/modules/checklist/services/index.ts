import { db } from "@/db";
import { AvaliacoesService } from "@/modules/checklist/services/avaliacoes.service";
import { TemplatesService } from "@/modules/checklist/services/templates.service";

export const templatesService = new TemplatesService(db);
export const avaliacoesService = new AvaliacoesService(db);
