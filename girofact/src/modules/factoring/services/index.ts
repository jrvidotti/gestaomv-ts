import { CalculosFinanceirosService } from "./calculos-financeiros.service";
import { CarteirasService } from "./carteiras.service";
import { PessoasService } from "./pessoas.service";
import { ClientesService } from "./clientes.service";
import { OperacoesService } from "./operacoes.service";
import { DocumentosService } from "./documentos.service";
import { OcorrenciasService } from "./ocorrencias.service";
import { LancamentosService } from "./lancamentos.service";
import { RecebimentosService } from "./recebimentos.service";
import { AnexosService } from "./anexos.service";
import { RelatoriosService } from "./relatorios.service";

// Singletons dos services
export const calculosFinanceiros = new CalculosFinanceirosService();
export const carteirasService = new CarteirasService();
export const pessoasService = new PessoasService();
export const clientesService = new ClientesService();
export const operacoesService = new OperacoesService();
export const documentosService = new DocumentosService();
export const ocorrenciasService = new OcorrenciasService();
export const lancamentosService = new LancamentosService();
export const recebimentosService = new RecebimentosService();
export const anexosService = new AnexosService();
export const relatoriosService = new RelatoriosService();

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
