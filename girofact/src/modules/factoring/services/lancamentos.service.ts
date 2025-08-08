import { db } from "@/db";
import { lancamentos } from "../schemas";
import { eq, desc, and, gte, lte, sum } from "drizzle-orm";
import type { PaginatedResponse } from "../dtos";
import { format } from "date-fns";

export class LancamentosService {
  async extratoCliente(clienteId: number, dataInicio?: Date, dataFim?: Date) {
    const conditions = [eq(lancamentos.clienteId, clienteId)];
    
    if (dataInicio) conditions.push(gte(lancamentos.dataLancamento, dataInicio.toISOString()));
    if (dataFim) conditions.push(lte(lancamentos.dataLancamento, dataFim.toISOString()));

    return db.query.lancamentos.findMany({
      where: and(...conditions),
      orderBy: [desc(lancamentos.dataLancamento)],
      with: {
        operacao: true,
        ocorrencia: true,
        carteira: {
          columns: { nome: true },
        },
        user: {
          columns: { name: true },
        },
      },
    });
  }

  async obterSaldoCliente(clienteId: number): Promise<number> {
    const result = await db
      .select({
        entradas: sum(lancamentos.valorLancamento),
      })
      .from(lancamentos)
      .where(
        and(
          eq(lancamentos.clienteId, clienteId),
          eq(lancamentos.tipoLancamento, "entrada")
        )
      );

    const entradas = result[0]?.entradas || 0;

    const resultSaidas = await db
      .select({
        saidas: sum(lancamentos.valorLancamento),
      })
      .from(lancamentos)
      .where(
        and(
          eq(lancamentos.clienteId, clienteId),
          eq(lancamentos.tipoLancamento, "saida")
        )
      );

    const saidas = resultSaidas[0]?.saidas || 0;

    return entradas - saidas;
  }
}