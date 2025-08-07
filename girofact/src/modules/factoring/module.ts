import { MODULE_STATUS, type ModuleData } from "@/constants";
import { Settings, Users } from "lucide-react";

export const MODULE_ROLES = {
  FACT_GESTOR: "fact_gestor",
  FACT_OPERADOR: "fact_operador",
} as const;

export const MODULE_DATA: ModuleData = {
  module: "factoring",
  title: "Factoring",
  description:
    "Módulo para controle de factoring, operações financeiras e crédito",
  url: "/admin/factoring",
  color: "bg-slate-500",
  status: MODULE_STATUS.ATIVO,
  icon: Settings,
  moduleRoles: MODULE_ROLES,
  moduleRolesData: {
    [MODULE_ROLES.FACT_GESTOR]: {
      value: MODULE_ROLES.FACT_GESTOR,
      label: "Gestor",
      description: "Gestão de operações e configurações",
      color: "destructive",
    },
    [MODULE_ROLES.FACT_OPERADOR]: {
      value: MODULE_ROLES.FACT_OPERADOR,
      label: "Operador",
      description: "Realização de operações",
      color: "destructive",
    },
  } as const,
  items: [
    {
      title: "Pessoas",
      url: "/admin/factoring/pessoas",
      icon: Users,
      status: MODULE_STATUS.DESENVOLVIMENTO,
    },
    {
      title: "Simulação",
      url: "/admin/factoring/simulacao",
      icon: Settings,
      status: MODULE_STATUS.DESENVOLVIMENTO,
    },
    {
      title: "Operações",
      url: "/admin/factoring/operacoes",
      icon: Settings,
      status: MODULE_STATUS.DESENVOLVIMENTO,
    },
  ],
  roles: [MODULE_ROLES.FACT_GESTOR, MODULE_ROLES.FACT_OPERADOR],
} as const;
