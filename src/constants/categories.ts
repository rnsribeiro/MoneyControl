export const expenseCategories = [
  { value: "moradia", label: "Moradia" },
  { value: "alimentacao", label: "Alimentacao" },
  { value: "transporte", label: "Transporte" },
  { value: "saude", label: "Saude" },
  { value: "lazer", label: "Lazer" },
  { value: "educacao", label: "Educacao" },
] as const;

export const investmentTypes = [
  { value: "tesouro", label: "Tesouro Direto" },
  { value: "acoes", label: "Acoes" },
  { value: "fii", label: "Fundos Imobiliarios" },
  { value: "cripto", label: "Criptoativos" },
  { value: "reserva", label: "Reserva de emergencia" },
] as const;

export const incomeSources = [
  { value: "salario", label: "Salario" },
  { value: "freelance", label: "Freelance" },
  { value: "comissao", label: "Comissao" },
  { value: "rendimento", label: "Rendimento" },
  { value: "outros", label: "Outros" },
] as const;

export const categoryKinds = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
  { value: "investment", label: "Investimento" },
] as const;
