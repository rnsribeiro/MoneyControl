import { describe, expect, it } from "vitest";
import { getDashboardSummary, getExpensesByCategory } from "@/lib/services/dashboard.service";

describe("dashboard.service", () => {
  it("calcula o resumo financeiro do dashboard", async () => {
    const summary = await getDashboardSummary();

    expect(summary.totalIncome).toBe(8600);
    expect(summary.receivedIncome).toBe(7400);
    expect(summary.expectedIncome).toBe(1200);
    expect(summary.totalExpenses).toBe(3710);
    expect(summary.paidExpenses).toBe(3050);
    expect(summary.pendingExpenses).toBe(660);
    expect(summary.totalInvested).toBe(1850);
    expect(summary.balance).toBe(3040);
    expect(summary.cashOnHand).toBe(2500);
    expect(summary.savingsRate).toBe(25);
  });

  it("retorna categorias de despesas com percentual", async () => {
    const categories = await getExpensesByCategory();

    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toMatchObject({
      category: expect.any(String),
      total: expect.any(Number),
      percentage: expect.any(Number),
    });
  });
});
