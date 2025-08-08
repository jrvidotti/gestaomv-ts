import { CalculosFinanceirosService } from "./calculos-financeiros.service";

// Singletons dos services
export const calculosFinanceiros = new CalculosFinanceirosService();

export * from "./calculos-financeiros.service";
