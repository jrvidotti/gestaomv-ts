import { db } from "@/db";
import { AuthService } from "./auth.service";
import { ConfiguracoesService } from "./configuracoes.service";
import { EmailService } from "./email.service";
import { NotificationsService } from "./notifications.service";
import { StorageService } from "./storage.service";
import { SuperadminService } from "./superadmin.service";
import { TemplateService } from "./template.service";
import { UsersService } from "./users.service";

export const configuracoesService = new ConfiguracoesService();
export const templateService = new TemplateService();
export const emailService = new EmailService(templateService);
export const storageService = new StorageService();
export const usersService = new UsersService(db);
export const superadminService = new SuperadminService(db, usersService);

export const notificationsService = new NotificationsService(
	configuracoesService,
	emailService,
	templateService,
	usersService,
);

export const authService = new AuthService(
	usersService,
	notificationsService,
	emailService,
);
