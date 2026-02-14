import { Link2 } from "lucide-react";
import { Status } from "@/models/types";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<Status, { variant: "default" | "success" | "warning" | "accent"; label: string }> = {
  "ikke begynt": { variant: "default", label: "ikke begynt" },
  "gjort": { variant: "success", label: "gjort" },
  "holder på": { variant: "accent", label: "holder på" },
  "står ikke på meg": { variant: "warning", label: "står ikke på meg" },
  "ferdig": { variant: "success", label: "ferdig" }
};

export default function StatusBadge({ status, muted }: { status: Status; muted?: boolean }) {
  const style = statusStyles[status];
  return (
    <Badge
      variant={style.variant}
      className={muted ? "opacity-60" : ""}
    >
      {status === "står ikke på meg" ? <Link2 className="h-3 w-3" /> : null}
      {style.label}
    </Badge>
  );
}
