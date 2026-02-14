import { Badge } from "@/components/ui/badge";
import { Priority } from "@/models/types";

const priorityStyles: Record<Priority, { variant: "muted" | "warning" | "danger"; label: string }> = {
  Lav: { variant: "muted", label: "Lav" },
  Medium: { variant: "warning", label: "Medium" },
  Høy: { variant: "danger", label: "Høy" }
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const style = priorityStyles[priority];
  return <Badge variant={style.variant}>{style.label}</Badge>;
}
