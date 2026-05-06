import { describe, expect, it } from "vitest";
import { expenseSchema } from "@/lib/validations/expense.schema";

describe("expenseSchema", () => {
  it("aceita uma despesa valida", () => {
    const result = expenseSchema.safeParse({
      title: "Conta de luz",
      amount: 240,
      category: "moradia",
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
      category: "moradia",
      dueDate: "2026-05-06",
      paymentMethod: "pix",
      status: "pending",
    });

    expect(result.success).toBe(false);
  });
});
