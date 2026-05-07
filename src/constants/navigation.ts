import {
  BarChart3,
  FolderTree,
  History,
  Landmark,
  PiggyBank,
  PlusCircle,
  ReceiptText,
  Target,
} from "lucide-react";

export const appNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Despesas",
    href: "/despesas",
    icon: ReceiptText,
  },
  {
    title: "Receitas",
    href: "/receitas",
    icon: Landmark,
  },
  {
    title: "Histórico",
    href: "/historico",
    icon: History,
  },
  {
    title: "Metas",
    href: "/metas",
    icon: Target,
  },
  {
    title: "Categorias",
    href: "/categorias",
    icon: FolderTree,
  },
  {
    title: "Nova despesa",
    href: "/despesas/nova",
    icon: PlusCircle,
  },
  {
    title: "Nova receita",
    href: "/receitas/nova",
    icon: PlusCircle,
  },
  {
    title: "Investimentos",
    href: "/investimentos",
    icon: PiggyBank,
  },
] as const;
