"use client";

import { Clock, MapPin } from "lucide-react";
import { Customer, Task } from "@/models/types";
import { cn } from "@/utils/cn";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TaskCard({
  task,
  customer,
  selected,
  onSelect,
  onStatusClick,
  compact
}: {
  task: Task;
  customer: Customer | undefined;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onStatusClick?: (id: string) => void;
  compact?: boolean;
}) {
  const muted = task.status === "står ikke på meg";
  const blocked = Boolean(task.blockedNow);
  return (
    <div
      onClick={() => onSelect?.(task.id)}
      className={cn(
        "cursor-pointer rounded-2xl border border-border bg-card p-3 shadow-sm transition",
        selected ? "ring-2 ring-accent/40" : "hover:shadow-soft",
        blocked && "border-danger/40",
        muted && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div>
            <div className="text-sm font-semibold text-text">{task.title}</div>
            <div className="text-xs text-muted">{customer?.name ?? "Ukjent kunde"}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {task.startTime ? (
              <div className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                {task.startTime} {task.endTime ? `– ${task.endTime}` : null}
              </div>
            ) : null}
            {task.location ? (
              <div className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {task.location}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onStatusClick?.(task.id);
            }}
          >
            <StatusBadge status={task.status} muted={muted} />
          </Button>
          {!compact ? <PriorityBadge priority={task.priority} /> : null}
          {task.blockedNow ? <Badge variant="danger">Blokkert</Badge> : null}
        </div>
      </div>
    </div>
  );
}
