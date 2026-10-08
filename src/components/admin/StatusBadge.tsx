const styles = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  CONFIRMED: "bg-green-500/15 text-green-600 dark:text-green-400",
  DECLINED: "bg-red-500/15 text-red-600 dark:text-red-400",
  CANCELLED: "bg-muted/20 text-muted",
} as const;

const labels = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  DECLINED: "Refusé",
  CANCELLED: "Annulé",
} as const;

export default function StatusBadge({
  status,
}: {
  status: keyof typeof labels;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}