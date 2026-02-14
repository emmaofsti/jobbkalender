"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Plus } from "lucide-react";
import { Customer, Task } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { isCompletedStatus } from "@/store/useAppStore";
import { todayISO } from "@/utils/date";
import { addDays, parseISO, differenceInCalendarDays } from "date-fns";

function getHealth(tasks: Task[]) {
  const openTasks = tasks.filter((task) => !isCompletedStatus(task.status));
  const hasBlocked = openTasks.some((task) => task.blockedNow);
  if (hasBlocked) return "red" as const;

  const now = new Date();
  const overdue = openTasks.filter((task) => task.deadline).some((task) => {
    const date = parseISO(task.deadline!);
    return date < now;
  });
  if (overdue) return "red" as const;

  const soon = addDays(now, 3);
  const upcoming = openTasks.filter((task) => task.deadline).some((task) => {
    const date = parseISO(task.deadline!);
    return date <= soon;
  });
  if (upcoming) return "yellow" as const;

  return "green" as const;
}

const healthStyles = {
  green: { color: "bg-success", label: "Stabil" },
  yellow: { color: "bg-warning", label: "Følg med" },
  red: { color: "bg-danger", label: "Trenger tiltak" }
};

export default function CustomerCard({
  customer,
  tasks,
  allTasks,
  onQuickAdd,
  onOpen
}: {
  customer: Customer;
  tasks: Task[];
  allTasks: Task[];
  onQuickAdd: (title: string) => void;
  onOpen: () => void;
}) {
  const [value, setValue] = useState("");

  const health = useMemo(() => getHealth(allTasks), [allTasks]);
  const openTasks = tasks.filter((task) => !isCompletedStatus(task.status));
  const completedTasks = tasks.filter((task) => isCompletedStatus(task.status));

  const dueInfo = useMemo(() => {
    const openAll = allTasks.filter((task) => !isCompletedStatus(task.status));
    const deadlines = openAll.filter((task) => task.deadline);
    if (!deadlines.length) return "Ingen aktive deadlines";
    const nearest = deadlines
      .map((task) => ({ task, days: differenceInCalendarDays(parseISO(task.deadline!), new Date()) }))
      .sort((a, b) => a.days - b.days)[0];
    if (nearest.days < 0) return `Forfalt (${nearest.task.deadline})`;
    if (nearest.days === 0) return `Deadline i dag (${nearest.task.deadline})`;
    return `Neste deadline: ${nearest.task.deadline}`;
  }, [allTasks]);

  return (
    <Card className="cursor-pointer" onClick={onOpen}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-display text-xl">{customer.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`h-2.5 w-2.5 rounded-full ${healthStyles[health].color}`} />
          <span className="text-muted">{healthStyles[health].label}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-muted">{dueInfo}</div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
            <Circle className="h-3 w-3" />
            Åpne oppgaver ({openTasks.length})
          </div>
          <div className="space-y-2">
            {openTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{task.title}</div>
                  <div className="text-xs text-muted">{task.date === todayISO() ? "I dag" : task.date}</div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
            {openTasks.length === 0 ? (
              <div className="text-xs text-muted">Ingen åpne oppgaver akkurat nå.</div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
            <CheckCircle2 className="h-3 w-3" />
            Fullførte oppgaver ({completedTasks.length})
          </div>
          <div className="space-y-2">
            {completedTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <div className="text-sm text-muted line-through">{task.title}</div>
                <StatusBadge status={task.status} />
              </div>
            ))}
            {completedTasks.length === 0 ? (
              <div className="text-xs text-muted">Ingen fullførte oppgaver ennå.</div>
            ) : null}
          </div>
        </div>

        <div
          className="rounded-xl border border-dashed border-border p-3"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
            <AlertTriangle className="h-3 w-3" />
            Rask oppgave for kunde
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder={`Ny oppgave for ${customer.name}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (value.trim()) {
                    onQuickAdd(value.trim());
                    setValue("");
                  }
                }
              }}
              onClick={(event) => event.stopPropagation()}
            />
            <Button
              variant="subtle"
              onClick={() => {
                if (!value.trim()) return;
                onQuickAdd(value.trim());
                setValue("");
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Plus className="h-4 w-4" />
              Legg til
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
