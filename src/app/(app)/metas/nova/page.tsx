import { GoalForm } from "@/components/forms/goal-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewGoalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar meta"
        description="Transforme um desejo em plano financeiro com valor-alvo, progresso reservado e prazo opcional."
      />
      <GoalForm />
    </div>
  );
}
