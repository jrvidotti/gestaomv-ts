import { db } from "@/db";
import { env } from "@/env";
import { AuthService } from "./auth.service";
import { ConfiguracoesService } from "./configuracoes.service";
import { EmailService } from "./email.service";
import { EmpresasService } from "./empresas.service";
import { NotificationsService } from "./notifications.service";
import { StorageService } from "./storage.service";
import { SuperadminService } from "./superadmin.service";
import { TagoneService } from "./tagone.service";
import { TemplateService } from "./template.service";
import { UnidadesService } from "./unidades.service";
import { UsersService } from "./users.service";

export const configuracoesService = new ConfiguracoesService();
export const templateService = new TemplateService();
export const emailService = new EmailService(templateService);
export const storageService = new StorageService();
export const tagoneService = new TagoneService(db, env.TAGONE_BASE_URL);

export const usersService = new UsersService(db);
export const empresasService = new EmpresasService(db);
export const unidadesService = new UnidadesService(db);

export const superadminService = new SuperadminService(db, usersService);

export const notificationsService = new NotificationsService(
	configuracoesService,
	emailService,
	templateService,
	usersService,
);

export const authService = new AuthService(
	usersService,
	tagoneService,
	notificationsService,
	emailService,
);
