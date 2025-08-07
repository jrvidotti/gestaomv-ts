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
  calcularDias(dataInicio: Date, dataVencimento: Date, float = 0): number {
    // Calcula dias corridos até vencimento
    const diasAteVencimento = Math.floor(
      (dataVencimento.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Adiciona float à data de vencimento
    const dataVencimentoComFloat = new Date(dataVencimento);
    dataVencimentoComFloat.setDate(dataVencimento.getDate() + float);

    // Verifica se a data com float cai em final de semana
    const diaSemana = dataVencimentoComFloat.getDay();
    let diasAdicionais = 0;

    if (diaSemana === 6) {
      // Sábado
      diasAdicionais = 2; // Adiciona sábado e domingo
    } else if (diaSemana === 0) {
      // Domingo
      diasAdicionais = 1; // Adiciona apenas domingo
    }

    return diasAteVencimento + float + diasAdicionais;
  }

  /**
   * Calcula juros de prorrogação
   */
  calcularJurosProrrogacao(
    valorDocumento: number,
    taxaJuros: number,
    dataVencimentoOriginal: Date,
    novaDataVencimento: Date,
    tipoJuros: TipoJuros = "simples"
  ): number {
    const diasProrrogacao = Math.floor(
      (novaDataVencimento.getTime() - dataVencimentoOriginal.getTime()) /
        (1000 * 60 * 60 * 24)
    );

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
  isDiaUtil(data: Date): boolean {
    const diaSemana = data.getDay();
    return diaSemana !== 0 && diaSemana !== 6; // Não é domingo nem sábado
  }

  /**
   * Adiciona dias úteis a uma data
   */
  adicionarDiasUteis(data: Date, dias: number): Date {
    const resultado = new Date(data);
    let diasAdicionados = 0;

    while (diasAdicionados < dias) {
      resultado.setDate(resultado.getDate() + 1);
      if (this.isDiaUtil(resultado)) {
        diasAdicionados++;
      }
    }

    return resultado;
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
