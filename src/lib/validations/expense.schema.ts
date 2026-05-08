import { z } from "zod";

export const expenseSchema = z
  .object({
    title: z.string().min(3, "Informe um titulo com pelo menos 3 caracteres."),
    amount: z.coerce.number().positive("Informe um valor maior que zero."),
    paidAmount: z.coerce.number().min(0, "O valor pago nao pode ser negativo."),
    category: z.string().min(1, "Selecione uma categoria."),
    hasDueDate: z.boolean(),
    dueDate: z.string().optional(),
    paymentMethod: z.string().min(1, "Selecione a forma de pagamento."),
    status: z.enum(["paid", "pending", "partial"]),
    notes: z.string().max(250, "Use ate 250 caracteres.").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.hasDueDate && !values.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Informe a data de vencimento.",
      });
    }

    if (values.paidAmount > values.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidAmount"],
        message: "O valor ja pago nao pode ser maior que o valor total.",
      });
    }

    if (values.status === "paid" && values.paidAmount !== values.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidAmount"],
        message: "Para despesas pagas, o valor pago deve ser igual ao valor total.",
      });
    }

    if (values.status === "pending" && values.paidAmount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidAmount"],
        message: "Para despesas pendentes, o valor pago deve ser zero.",
      });
    }

    if (
      values.status === "partial" &&
      (values.paidAmount <= 0 || values.paidAmount >= values.amount)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidAmount"],
        message: "Para pagamentos parciais, informe um valor maior que zero e menor que o total.",
      });
    }
  });

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
