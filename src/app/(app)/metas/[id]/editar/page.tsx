import { notFound } from "next/navigation";
import { GoalForm } from "@/components/forms/goal-form";
import { PageHeader } from "@/components/shared/page-header";
import { getGoalById } from "@/lib/services/goals.service";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goal = await getGoalById(id);

  if (!goal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar meta"
        description="Atualize o valor reservado, o prazo ou o objetivo para manter seu planejamento sempre fiel à realidade."
      />
      <GoalForm
        initialValues={{
          id: goal.id,
          title: goal.title,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate,
          notes: goal.notes,
        }}
      />
    </div>
  );
}
