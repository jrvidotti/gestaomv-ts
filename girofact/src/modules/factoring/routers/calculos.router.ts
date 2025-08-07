import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { calculosFinanceirosSchema } from "../dtos";
import { factoringServices } from "../services";

export const calculosRouter = createTRPCRouter({
  // Calcular juros simples/compostos
  calcularJuros: protectedProcedure
    .input(calculosFinanceirosSchema)
    .query(async ({ input }) => {
      const juros = factoringServices.calculosFinanceiros.calcularJuros(
        input.valorPrincipal,
        input.taxaJuros,
        input.dias,
        input.tipoJuros
      );

      const valorLiquido = input.valorPrincipal - juros;

      return {
        valorPrincipal: input.valorPrincipal,
        juros,
        valorLiquido,
        taxaEfetiva: factoringServices.calculosFinanceiros.calcularTaxaEfetiva(
          input.taxaJuros,
          input.dias,
          input.tipoJuros
        ),
      };
    }),

  // Calcular dias entre datas
  calcularDias: protectedProcedure
    .input(
      z.object({
        dataInicio: z.date(),
        dataVencimento: z.date(),
        float: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const diasCorridos = Math.floor(
        (input.dataVencimento.getTime() - input.dataInicio.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const diasTotais = factoringServices.calculosFinanceiros.calcularDias(
        input.dataInicio,
        input.dataVencimento,
        input.float
      );

      return {
        diasCorridos,
        float: input.float,
        diasTotais,
        diasAdicionais: diasTotais - diasCorridos - input.float,
      };
    }),

  // Calcular juros de prorrogação
  calcularJurosProrrogacao: protectedProcedure
    .input(
      z.object({
        valorDocumento: z.number().positive(),
        taxaJuros: z.number().min(0).max(100),
        dataVencimentoOriginal: z.date(),
        novaDataVencimento: z.date(),
        tipoJuros: z.enum(["simples", "composto"]).default("simples"),
      })
    )
    .query(async ({ input }) => {
      const jurosProrrogacao =
        factoringServices.calculosFinanceiros.calcularJurosProrrogacao(
          input.valorDocumento,
          input.taxaJuros,
          input.dataVencimentoOriginal,
          input.novaDataVencimento,
          input.tipoJuros
        );

      const diasProrrogacao = Math.floor(
        (input.novaDataVencimento.getTime() -
          input.dataVencimentoOriginal.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        valorDocumento: input.valorDocumento,
        diasProrrogacao,
        jurosProrrogacao,
        valorTotal: input.valorDocumento + jurosProrrogacao,
      };
    }),

  // Calcular valor presente
  calcularValorPresente: protectedProcedure
    .input(
      z.object({
        valorFuturo: z.number().positive(),
        taxaJuros: z.number().min(0).max(100),
        dias: z.number().positive(),
        tipoJuros: z.enum(["simples", "composto"]).default("simples"),
      })
    )
    .query(async ({ input }) => {
      const valorPresente =
        factoringServices.calculosFinanceiros.calcularValorPresente(
          input.valorFuturo,
          input.taxaJuros,
          input.dias,
          input.tipoJuros
        );

      const desconto = input.valorFuturo - valorPresente;

      return {
        valorFuturo: input.valorFuturo,
        valorPresente,
        desconto,
        taxaDesconto: (desconto / input.valorFuturo) * 100,
      };
    }),

  // Verificar se é dia útil
  isDiaUtil: protectedProcedure
    .input(z.object({ data: z.date() }))
    .query(async ({ input }) => {
      return {
        data: input.data,
        isDiaUtil: factoringServices.calculosFinanceiros.isDiaUtil(input.data),
        diaSemana: input.data.getDay(),
      };
    }),

  // Adicionar dias úteis
  adicionarDiasUteis: protectedProcedure
    .input(
      z.object({
        data: z.date(),
        dias: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const novaData = factoringServices.calculosFinanceiros.adicionarDiasUteis(
        input.data,
        input.dias
      );

      return {
        dataOriginal: input.data,
        diasAdicionados: input.dias,
        novaData,
      };
    }),

  // Calcular taxa efetiva
  calcularTaxaEfetiva: protectedProcedure
    .input(
      z.object({
        taxaNominal: z.number().min(0).max(100),
        diasPeriodo: z.number().positive(),
        tipoJuros: z.enum(["simples", "composto"]).default("simples"),
      })
    )
    .query(async ({ input }) => {
      const taxaEfetiva =
        factoringServices.calculosFinanceiros.calcularTaxaEfetiva(
          input.taxaNominal,
          input.diasPeriodo,
          input.tipoJuros
        );

      return {
        taxaNominalMensal: input.taxaNominal,
        diasPeriodo: input.diasPeriodo,
        taxaEfetivaPeriodo: taxaEfetiva,
        taxaEfetivaMensal: (taxaEfetiva / input.diasPeriodo) * 30,
      };
    }),
});
