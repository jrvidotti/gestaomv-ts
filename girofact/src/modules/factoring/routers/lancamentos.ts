import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { lancamentosService } from "../services";
import { z } from "zod";

export const lancamentosRouter = createTRPCRouter({
  extratoCliente: protectedProcedure
    .input(z.object({
      clienteId: z.number(),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional(),
    }))
    .query(async ({ input }) => {
      return lancamentosService.extratoCliente(
        input.clienteId,
        input.dataInicio,
        input.dataFim
      );
    }),

  obterSaldoCliente: protectedProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return lancamentosService.obterSaldoCliente(input.clienteId);
    }),
});