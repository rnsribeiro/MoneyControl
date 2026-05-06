import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};
