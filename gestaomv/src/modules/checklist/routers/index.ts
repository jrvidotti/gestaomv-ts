import { createTRPCRouter } from "@/trpc/init";
import { avaliacoesRouter } from "./avaliacoes.router";
import { templatesRouter } from "./templates.router";

export const checklistRouter = createTRPCRouter({
	templates: templatesRouter,
	avaliacoes: avaliacoesRouter,
});
