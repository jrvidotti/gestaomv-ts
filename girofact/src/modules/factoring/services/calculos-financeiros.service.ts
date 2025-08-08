import { 
  addDays, 
  differenceInCalendarDays, 
  getDay, 
  isWeekend,
  addBusinessDays,
  format,
  parseISO,
  startOfDay,
  endOfDay
} from "date-fns";
import type { TipoJuros } from "../enums";

export class CalculosFinanceirosService {
  /**
   * Calcula os juros de uma operação
   */
  calcularJuros(
    valorPrincipal: number,
    taxaJurosMensal: number,
    dias: number,
    tipoJuros: TipoJuros = "simples"
  ): number {
    // Converte taxa mensal para diária
    const taxaDiaria = taxaJurosMensal / 30 / 100;

    if (tipoJuros === "simples") {
      return valorPrincipal * taxaDiaria * dias;
    }
    // Juros compostos
    return valorPrincipal * ((1 + taxaDiaria) ** dias - 1);
  }

  /**
   * Calcula os dias entre duas datas considerando regras de negócio
   */
  calcularDias(
    dataInicio: Date | string,
    dataVencimento: Date | string,
    float = 0
  ): number {
    // Converter strings para Date se necessário
    const inicio = typeof dataInicio === 'string' ? parseISO(dataInicio) : dataInicio;
    const vencimento = typeof dataVencimento === 'string' ? parseISO(dataVencimento) : dataVencimento;

    // Calcula dias corridos até vencimento
    const diasAteVencimento = differenceInCalendarDays(vencimento, inicio);

    // Adiciona float à data de vencimento
    const dataVencimentoComFloat = addDays(vencimento, float);

    // Verifica se a data com float cai em final de semana
    let diasAdicionais = 0;

    if (isWeekend(dataVencimentoComFloat)) {
      const diaSemana = getDay(dataVencimentoComFloat);
      if (diaSemana === 6) {
        // Sábado - adiciona sábado e domingo
        diasAdicionais = 2;
      } else if (diaSemana === 0) {
        // Domingo - adiciona apenas domingo
        diasAdicionais = 1;
      }
    }

    return diasAteVencimento + float + diasAdicionais;
  }

  /**
   * Calcula juros de prorrogação
   */
  calcularJurosProrrogacao(
    valorDocumento: number,
    taxaJuros: number,
    dataVencimentoOriginal: Date | string,
    novaDataVencimento: Date | string,
    tipoJuros: TipoJuros = "simples"
  ): number {
    // Converter strings para Date se necessário
    const original = typeof dataVencimentoOriginal === 'string' 
      ? parseISO(dataVencimentoOriginal) 
      : dataVencimentoOriginal;
    const nova = typeof novaDataVencimento === 'string' 
      ? parseISO(novaDataVencimento) 
      : novaDataVencimento;

    const diasProrrogacao = differenceInCalendarDays(nova, original);

    return this.calcularJuros(
      valorDocumento,
      taxaJuros,
      diasProrrogacao,
      tipoJuros
    );
  }

  /**
   * Calcula valor presente de um documento
   */
  calcularValorPresente(
    valorFuturo: number,
    taxaJuros: number,
    dias: number,
    tipoJuros: TipoJuros = "simples"
  ): number {
    const taxaDiaria = taxaJuros / 30 / 100;

    if (tipoJuros === "simples") {
      return valorFuturo / (1 + taxaDiaria * dias);
    }
    return valorFuturo / (1 + taxaDiaria) ** dias;
  }

  /**
   * Verifica se uma data é dia útil (considera apenas fins de semana)
   */
  isDiaUtil(data: Date | string): boolean {
    const date = typeof data === 'string' ? parseISO(data) : data;
    return !isWeekend(date);
  }

  /**
   * Adiciona dias úteis a uma data usando date-fns
   */
  adicionarDiasUteis(data: Date | string, dias: number): Date {
    const date = typeof data === 'string' ? parseISO(data) : data;
    return addBusinessDays(date, dias);
  }

  /**
   * Arredonda valor monetário para 2 casas decimais
   */
  arredondarValor(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  /**
   * Formata valor para exibição
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  /**
   * Formatar data usando date-fns
   */
  formatarData(data: Date | string, formato = "dd/MM/yyyy"): string {
    const date = typeof data === 'string' ? parseISO(data) : data;
    return format(date, formato);
  }

  /**
   * Formatar data e hora usando date-fns
   */
  formatarDataHora(data: Date | string, formato = "dd/MM/yyyy HH:mm"): string {
    const date = typeof data === 'string' ? parseISO(data) : data;
    return format(date, formato);
  }

  /**
   * Converte data para início do dia (00:00:00)
   */
  iniciarDia(data: Date | string): Date {
    const date = typeof data === 'string' ? parseISO(data) : data;
    return startOfDay(date);
  }

  /**
   * Converte data para fim do dia (23:59:59)
   */
  finalizarDia(data: Date | string): Date {
    const date = typeof data === 'string' ? parseISO(data) : data;
    return endOfDay(date);
  }

  /**
   * Calcula taxa efetiva considerando período
   */
  calcularTaxaEfetiva(
    taxaNominal: number,
    diasPeriodo: number,
    tipoJuros: TipoJuros = "simples"
  ): number {
    const taxaDiaria = taxaNominal / 30 / 100;

    if (tipoJuros === "simples") {
      return taxaDiaria * diasPeriodo * 100;
    }
    return ((1 + taxaDiaria) ** diasPeriodo - 1) * 100;
  }
}
