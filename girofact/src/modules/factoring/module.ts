import { MODULE_STATUS, type ModuleData } from "@/constants";
import {
  Building,
  Calculator,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";

export const MODULE_ROLES = {
  OPERADOR: "factoring_operador",
  APROVADOR: "factoring_aprovador",
  GERENTE: "factoring_gerente",
  ANALISTA: "factoring_analista",
} as const;

export const MODULE_DATA: ModuleData = {
  module: "factoring",
  title: "Factoring",
  description: "Controle de operações de crédito e factoring",
  url: "/admin/factoring",
  color: "bg-green-600",
  status: MODULE_STATUS.ATIVO,
  icon: Calculator,
  moduleRoles: MODULE_ROLES,
  moduleRolesData: {
    [MODULE_ROLES.OPERADOR]: {
      value: MODULE_ROLES.OPERADOR,
      label: "Operador",
      description: "Cadastro de clientes e operações",
      color: "secondary",
    },
    [MODULE_ROLES.APROVADOR]: {
      value: MODULE_ROLES.APROVADOR,
      label: "Aprovador",
      description: "Aprovação de operações",
      color: "default",
    },
    [MODULE_ROLES.GERENTE]: {
      value: MODULE_ROLES.GERENTE,
      label: "Gerente",
      description: "Gestão completa do factoring",
      color: "destructive",
    },
    [MODULE_ROLES.ANALISTA]: {
      value: MODULE_ROLES.ANALISTA,
      label: "Analista",
      description: "Análise de crédito e relatórios",
      color: "outline",
    },
  } as const,
  items: [
    {
      title: "Dashboard",
      url: "/admin/factoring",
      icon: TrendingUp,
      status: MODULE_STATUS.ATIVO,
    },
    {
      title: "Cadastros",
      url: "/admin/factoring/cadastros",
      icon: Building,
      status: MODULE_STATUS.DESENVOLVIMENTO,
      items: [
        {
          title: "Pessoas",
          url: "/admin/factoring/pessoas",
          icon: Users,
          status: MODULE_STATUS.ATIVO,
        },
        {
          title: "Clientes",
          url: "/admin/factoring/clientes",
          icon: Users,
          status: MODULE_STATUS.DESENVOLVIMENTO,
        },
        {
          title: "Carteiras",
          url: "/admin/factoring/carteiras",
          icon: CreditCard,
          status: MODULE_STATUS.ATIVO,
        },
      ],
    },
    {
      title: "Operações",
      url: "/admin/factoring/operacoes",
      icon: Calculator,
      status: MODULE_STATUS.DESENVOLVIMENTO,
      items: [
        {
          title: "Operações",
          url: "/admin/factoring/operacoes",
          icon: FileText,
          status: MODULE_STATUS.ATIVO,
        },
        {
          title: "Documentos",
          url: "/admin/factoring/operacoes/documentos",
          icon: FileText,
          status: MODULE_STATUS.DESENVOLVIMENTO,
        },
      ],
    },
    {
      title: "Relatórios",
      url: "/admin/factoring/relatorios",
      icon: TrendingUp,
      status: MODULE_STATUS.DESENVOLVIMENTO,
    },
  ],
  roles: [
    MODULE_ROLES.OPERADOR,
    MODULE_ROLES.APROVADOR,
    MODULE_ROLES.GERENTE,
    MODULE_ROLES.ANALISTA,
  ],
} as const;
