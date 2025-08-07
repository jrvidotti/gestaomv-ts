import { CalculosFinanceirosService } from "./calculos-financeiros.service";
import { clientesService } from "./clientes.service";
import { pessoasService } from "./pessoas.service";

// Instância global dos serviços para uso fácil
export const factoringServices = {
  calculosFinanceiros: new CalculosFinanceirosService(),
  pessoas: pessoasService,
  clientes: clientesService,
};
