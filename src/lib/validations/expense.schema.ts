import { z } from "zod";

export const expenseSchema = z
  .object({
    title: z.string().min(3, "Informe um título com pelo menos 3 caracteres."),
    amount: z.coerce.number().positive("Informe um valor maior que zero."),
    paidAmount: z.coerce.number().min(0, "O valor pago não pode ser negativo."),
    category: z.string().min(1, "Selecione uma categoria."),
    dueDate: z.string().min(1, "Informe a data de vencimento."),
    paymentMethod: z.string().min(1, "Selecione a forma de pagamento."),
    status: z.enum(["paid", "pending", "partial"]),
    notes: z.string().max(250, "Use até 250 caracteres.").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.paidAmount > values.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidAmount"],
        message: "O valor já pago não pode ser maior que o valor total.",
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
