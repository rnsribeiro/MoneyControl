export function GoalProgressBar({
  progressPercentage,
}: {
  progressPercentage: number;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-lime-400 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
      />
    </div>
  );
}
