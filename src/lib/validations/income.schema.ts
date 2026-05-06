import { z } from "zod";

export const incomeSchema = z.object({
  title: z.string().min(3, "Informe um titulo com pelo menos 3 caracteres."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  source: z.string().min(1, "Selecione a origem da receita."),
  date: z.string().min(1, "Informe a data da receita."),
  status: z.enum(["received", "expected"]),
  notes: z.string().max(250, "Use ate 250 caracteres.").optional(),
});

export type IncomeFormInput = z.input<typeof incomeSchema>;
export type IncomeFormValues = z.infer<typeof incomeSchema>;
