import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TipoOcorrencia } from "../enums";
import { TIPOS_OCORRENCIA_ARRAY } from "../enums";
import { documentos } from "./documentos";

export const ocorrencias = sqliteTable("factoring_ocorrencias", {
  id: idAutoIncrement(),
  documentoId: integer("documento_id")
    .references(() => documentos.id, { onDelete: "cascade" })
    .notNull(),
  tipoOcorrencia: text("tipo_ocorrencia", { enum: TIPOS_OCORRENCIA_ARRAY })
    .$type<TipoOcorrencia>()
    .notNull(),
  dataOcorrencia: text("data_ocorrencia").notNull(),
  valorTarifa: real("valor_tarifa"),
  valorJuros: real("valor_juros"),

  // se tipo prorrogacao
  dataVencimentoAtual: text("data_vencimento_atual"),
  dataVencimentoProrrogada: text("data_vencimento_prorrogada"),

  // se tipo devolucao
  alineaDevolucao: text("alinea_devolucao"),

  userId: integer("user_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  observacao: text("observacao"),
  ...timestamps(),
});

// Relations
export const ocorrenciasDocumentoRelations = relations(
  ocorrencias,
  ({ one }) => ({
    documento: one(documentos, {
      fields: [ocorrencias.documentoId],
      references: [documentos.id],
    }),
    user: one(users, {
      fields: [ocorrencias.userId],
      references: [users.id],
    }),
  })
);
