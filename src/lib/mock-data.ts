import type {
  Expense,
  Income,
  Investment,
  MonthlyOverviewPoint,
} from "@/types/finance";
import { getMonthLabel } from "@/utils/date";

export const mockExpenses: Expense[] = [
  {
    id: "exp-1",
    title: "Aluguel",
    amount: 1800,
    category: "moradia",
    date: "2026-05-02",
    dueDate: "2026-05-02",
    paidAt: "2026-05-02",
    paymentMethod: "pix",
    status: "paid",
  },
  {
    id: "exp-2",
    title: "Supermercado",
    amount: 720,
    category: "alimentacao",
    date: "2026-05-04",
    dueDate: "2026-05-04",
    paidAt: "2026-05-04",
    paymentMethod: "credito",
    status: "paid",
  },
  {
    id: "exp-3",
    title: "Combustível",
    amount: 320,
    category: "transporte",
    date: "2026-05-01",
    dueDate: "2026-05-01",
    paidAt: "2026-05-01",
    paymentMethod: "debito",
    status: "paid",
  },
  {
    id: "exp-4",
    title: "Plano de saúde",
    amount: 540,
    category: "saude",
    date: "2026-05-10",
    dueDate: "2026-05-10",
    paymentMethod: "boleto",
    status: "pending",
  },
  {
    id: "exp-5",
    title: "Cinema e jantar",
    amount: 210,
    category: "lazer",
    date: "2026-05-05",
    dueDate: "2026-05-05",
    paidAt: "2026-05-05",
    paymentMethod: "credito",
    status: "paid",
  },
  {
    id: "exp-6",
    title: "Internet",
    amount: 120,
    category: "moradia",
    date: "2026-05-03",
    dueDate: "2026-05-03",
    paymentMethod: "débito automático",
    status: "overdue",
  },
];

export const mockIncomes: Income[] = [
  {
    id: "inc-1",
    title: "Salário",
    amount: 6500,
    source: "trabalho",
    date: "2026-05-01",
    expectedDate: "2026-05-01",
    receivedAt: "2026-05-01",
    status: "received",
  },
  {
    id: "inc-2",
    title: "Freelance",
    amount: 1200,
    source: "extra",
    date: "2026-05-25",
    expectedDate: "2026-05-25",
    status: "expected",
  },
  {
    id: "inc-3",
    title: "Bônus trimestral",
    amount: 900,
    source: "comissao",
    date: "2026-05-07",
    expectedDate: "2026-05-07",
    receivedAt: "2026-05-07",
    status: "received",
  },
];

export const mockInvestments: Investment[] = [
  {
    id: "inv-1",
    name: "Tesouro Selic",
    type: "tesouro",
    amount: 1000,
    date: "2026-05-02",
    broker: "NuInvest",
    goal: "reserva",
  },
  {
    id: "inv-2",
    name: "ETF IVVB11",
    type: "acoes",
    amount: 850,
    date: "2026-05-04",
    broker: "XP",
    goal: "longo prazo",
  },
];

export const monthlyOverview: MonthlyOverviewPoint[] = [
  { month: getMonthLabel(5), income: 7000, expense: 4100, investment: 1200 },
  { month: getMonthLabel(4), income: 6800, expense: 3950, investment: 900 },
  { month: getMonthLabel(3), income: 7200, expense: 4200, investment: 1450 },
  { month: getMonthLabel(2), income: 7600, expense: 4380, investment: 1600 },
  { month: getMonthLabel(1), income: 7350, expense: 4460, investment: 1300 },
  { month: getMonthLabel(0), income: 8600, expense: 3710, investment: 1850 },
];

