import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().min(3, "Informe uma meta com pelo menos 3 caracteres."),
  targetAmount: z.coerce.number().positive("Informe um valor-alvo maior que zero."),
  currentAmount: z.coerce.number().min(0, "O valor reservado não pode ser negativo."),
  targetDate: z.string().optional(),
  notes: z.string().max(250, "Use até 250 caracteres.").optional(),
}).superRefine((values, ctx) => {
  if (values.currentAmount > values.targetAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["currentAmount"],
      message: "O valor reservado não pode ser maior que o valor-alvo.",
    });
  }
});

export type GoalFormInput = z.input<typeof goalSchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
