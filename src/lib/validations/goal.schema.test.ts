import { describe, expect, it } from "vitest";
import { goalSchema } from "@/lib/validations/goal.schema";

describe("goalSchema", () => {
  it("aceita uma meta sem data limite", () => {
    const result = goalSchema.safeParse({
      title: "Comprar um carro",
      targetAmount: 45000,
      currentAmount: 5000,
      hasTargetDate: false,
      notes: "Objetivo sem prazo fechado.",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita uma meta com prazo sem data preenchida", () => {
    const result = goalSchema.safeParse({
      title: "Viajem",
      targetAmount: 12000,
      currentAmount: 1000,
      hasTargetDate: true,
      targetDate: "",
    });

    expect(result.success).toBe(false);
  });
});
