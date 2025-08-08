import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { relatoriosService } from "../services";
import { z } from "zod";

export const relatoriosRouter = createTRPCRouter({
  dashboardExecutivo: protectedProcedure
    .input(z.object({
      dataInicio: z.date(),
      dataFim: z.date(),
    }))
    .query(async ({ input }) => {
      return relatoriosService.dashboardExecutivo(input.dataInicio, input.dataFim);
    }),

  posicaoDocumentos: protectedProcedure
    .input(z.object({
      dataReferencia: z.date().default(new Date()),
    }))
    .query(async ({ input }) => {
      return relatoriosService.posicaoDocumentos(input.dataReferencia);
    }),

  carteiraClientes: protectedProcedure
    .query(async () => {
      return relatoriosService.carteiraClientes();
    }),
});