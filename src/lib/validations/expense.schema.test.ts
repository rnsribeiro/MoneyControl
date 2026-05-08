import { describe, expect, it } from "vitest";
import { expenseSchema } from "@/lib/validations/expense.schema";

describe("expenseSchema", () => {
  it("aceita uma despesa valida", () => {
    const result = expenseSchema.safeParse({
      title: "Conta de luz",
      amount: 240,
      paidAmount: 0,
      category: "moradia",
      hasDueDate: true,
      dueDate: "2026-05-06",
      paymentMethod: "pix",
      status: "pending",
      notes: "Pagamento referente ao mes atual",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita valor zero", () => {
    const result = expenseSchema.safeParse({
      title: "Conta de luz",
      amount: 0,
      paidAmount: 0,
      category: "moradia",
      hasDueDate: true,
      dueDate: "2026-05-06",
      paymentMethod: "pix",
      status: "pending",
    });

    expect(result.success).toBe(false);
  });

  it("aceita uma despesa sem vencimento", () => {
    const result = expenseSchema.safeParse({
      title: "Mercado eventual",
      amount: 180,
      paidAmount: 180,
      category: "alimentacao",
      hasDueDate: false,
      paymentMethod: "pix",
      status: "paid",
    });

    expect(result.success).toBe(true);
  });
});
