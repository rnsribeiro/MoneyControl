import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(3, "Informe um titulo com pelo menos 3 caracteres."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  category: z.string().min(1, "Selecione uma categoria."),
  dueDate: z.string().min(1, "Informe a data de vencimento."),
  paymentMethod: z.string().min(1, "Selecione a forma de pagamento."),
  status: z.enum(["paid", "pending"]),
  notes: z.string().max(250, "Use ate 250 caracteres.").optional(),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
