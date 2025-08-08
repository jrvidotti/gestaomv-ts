import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { clientesService } from "../services";
import {
  createClienteSchema,
  updateClienteSchema,
  findClienteSchema,
  listClientesSchema,
  analiseCreditoSchema,
} from "../dtos";
import { z } from "zod";

export const clientesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createClienteSchema)
    .mutation(async ({ input, ctx }) => {
      return clientesService.create(input, ctx.user.id);
    }),

  findById: protectedProcedure
    .input(findClienteSchema)
    .query(async ({ input }) => {
      return clientesService.findById(input);
    }),

  list: protectedProcedure
    .input(listClientesSchema)
    .query(async ({ input }) => {
      return clientesService.list(input);
    }),

  update: protectedProcedure
    .input(updateClienteSchema)
    .mutation(async ({ input, ctx }) => {
      return clientesService.update(input, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(findClienteSchema)
    .mutation(async ({ input }) => {
      return clientesService.delete(input);
    }),

  analisarCredito: protectedProcedure
    .input(analiseCreditoSchema)
    .mutation(async ({ input, ctx }) => {
      return clientesService.analisarCredito(input, ctx.user.id);
    }),

  obterLimiteDisponivel: protectedProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return clientesService.obterLimiteDisponivel(input.clienteId);
    }),

  buscarClientesComLimiteDisponivel: protectedProcedure
    .input(z.object({ limiteMinimo: z.number().default(0) }))
    .query(async ({ input }) => {
      return clientesService.buscarClientesComLimiteDisponivel(input.limiteMinimo);
    }),

  obterEstatisticasCliente: protectedProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return clientesService.obterEstatisticasCliente(input.clienteId);
    }),
});