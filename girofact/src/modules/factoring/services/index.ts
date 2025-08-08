import { db } from "@/db";
import { directDataService, viaCepService } from "@/modules/consultas/services";
import { AnexosService } from "./anexos.service";
import { CalculosFinanceirosService } from "./calculos-financeiros.service";
import { CarteirasService } from "./carteiras.service";
import { ClientesService } from "./clientes.service";
import { DocumentosService } from "./documentos.service";
import { LancamentosService } from "./lancamentos.service";
import { OcorrenciasService } from "./ocorrencias.service";
import { OperacoesService } from "./operacoes.service";
import { PessoasService } from "./pessoas.service";
import { RecebimentosService } from "./recebimentos.service";
import { RelatoriosService } from "./relatorios.service";

// Singletons dos services
export const calculosFinanceiros = new CalculosFinanceirosService();
export const carteirasService = new CarteirasService(db);
export const pessoasService = new PessoasService(
	db,
	directDataService,
	viaCepService,
);
export const clientesService = new ClientesService(db);
export const operacoesService = new OperacoesService(db);
export const documentosService = new DocumentosService(db);
export const ocorrenciasService = new OcorrenciasService(db);
export const lancamentosService = new LancamentosService(db);
export const recebimentosService = new RecebimentosService(db);
export const anexosService = new AnexosService(db);
export const relatoriosService = new RelatoriosService(db);

// Exports das classes
export * from "./calculos-financeiros.service";
export * from "./carteiras.service";
export * from "./pessoas.service";
export * from "./clientes.service";
export * from "./operacoes.service";
export * from "./documentos.service";
export * from "./ocorrencias.service";
export * from "./lancamentos.service";
export * from "./recebimentos.service";
export * from "./anexos.service";
export * from "./relatorios.service";
