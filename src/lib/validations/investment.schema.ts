import { z } from "zod";

export const investmentSchema = z.object({
  name: z.string().min(3, "Informe o nome do investimento."),
  type: z.string().min(1, "Selecione o tipo de investimento."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  broker: z.string().min(2, "Informe a corretora."),
  goal: z.string().min(2, "Informe o objetivo do aporte."),
  date: z.string().min(1, "Informe uma data."),
  notes: z.string().max(250, "Use ate 250 caracteres.").optional(),
});

export type InvestmentFormInput = z.input<typeof investmentSchema>;
export type InvestmentFormValues = z.infer<typeof investmentSchema>;
