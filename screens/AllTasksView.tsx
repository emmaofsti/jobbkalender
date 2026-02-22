"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { todayISO } from "@/utils/date";

export default function AllTasksView() {
  const tasks = useAppStore((state) => state.tasks);
  const customers = useAppStore((state) => state.customers);
  const setEditingTaskId = useAppStore((state) => state.setEditingTaskId);

  const today = todayISO();

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.date === today && task.status !== "gjort"),
    [tasks, today]
  );
  const laterTasks = useMemo(
    () => tasks.filter((task) => task.date > today && task.status !== "gjort"),
    [tasks, today]
  );
  const earlierTasks = useMemo(
    () => tasks.filter((task) => task.date < today || task.status === "gjort"),
    [tasks, today]
  );

  const TaskRow = ({ task }: { task: typeof tasks[number] }) => (
    <div
      onClick={() => setEditingTaskId(task.id)}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:shadow-soft"
    >
      <div className="space-y-1">
        <div className="text-sm font-semibold text-text">{task.title}</div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{customers.find((c) => c.id === task.customerId)?.name || "Ukjent kunde"}</span>
          <span>📅 {task.date}</span>
          {task.startTime && <span>🕐 {task.startTime}</span>}
          {task.note && <span className="max-w-[200px] truncate">💬 {task.note}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Alle oppgaver</div>
              <div className="font-display text-2xl">I dag og senere</div>
            </div>
            <div className="text-xs text-muted">Klikk på en oppgave for å redigere.</div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>I dag <Badge variant="accent">{todayTasks.length}</Badge></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-sm text-muted">Ingen oppgaver i dag.</div>
                ) : (
                  todayTasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Senere <Badge variant="default">{laterTasks.length}</Badge></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {laterTasks.length === 0 ? (
                  <div className="text-sm text-muted">Ingen kommende oppgaver.</div>
                ) : (
                  laterTasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tidligere <Badge variant="muted">{earlierTasks.length}</Badge></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {earlierTasks.length === 0 ? (
                <div className="text-sm text-muted">Ingen tidligere oppgaver.</div>
              ) : (
                earlierTasks.map((task) => <TaskRow key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
