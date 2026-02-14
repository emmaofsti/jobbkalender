"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { todayISO } from "@/utils/date";

export default function AllTasksView() {
  const tasks = useAppStore((state) => state.tasks);
  const customers = useAppStore((state) => state.customers);
  const updateTask = useAppStore((state) => state.updateTask);

  const today = todayISO();

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.date === today),
    [tasks, today]
  );
  const laterTasks = useMemo(
    () => tasks.filter((task) => task.date > today),
    [tasks, today]
  );
  const earlierTasks = useMemo(
    () => tasks.filter((task) => task.date < today),
    [tasks, today]
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
            <div className="text-xs text-muted">Oppdater kommentarer direkte i listen.</div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>I dag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayTasks.length === 0 ? (
                  <div className="text-sm text-muted">Ingen oppgaver i dag.</div>
                ) : (
                  todayTasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-text">{task.title}</div>
                          <div className="text-xs text-muted">
                            {customers.find((c) => c.id === task.customerId)?.name || "Ukjent kunde"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={task.status} />
                          <Badge variant="muted">{task.date}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Label>Kommentar</Label>
                        <Textarea
                          value={task.note ?? ""}
                          onChange={(event) => updateTask(task.id, { note: event.target.value })}
                          placeholder="Skriv kommentar"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Senere</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {laterTasks.length === 0 ? (
                  <div className="text-sm text-muted">Ingen kommende oppgaver.</div>
                ) : (
                  laterTasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-text">{task.title}</div>
                          <div className="text-xs text-muted">
                            {customers.find((c) => c.id === task.customerId)?.name || "Ukjent kunde"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={task.status} />
                          <Badge variant="muted">{task.date}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Label>Kommentar</Label>
                        <Textarea
                          value={task.note ?? ""}
                          onChange={(event) => updateTask(task.id, { note: event.target.value })}
                          placeholder="Skriv kommentar"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tidligere</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {earlierTasks.length === 0 ? (
                <div className="text-sm text-muted">Ingen tidligere oppgaver.</div>
              ) : (
                earlierTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-text">{task.title}</div>
                        <div className="text-xs text-muted">
                          {customers.find((c) => c.id === task.customerId)?.name || "Ukjent kunde"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={task.status} />
                        <Badge variant="muted">{task.date}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label>Kommentar</Label>
                      <Textarea
                        value={task.note ?? ""}
                        onChange={(event) => updateTask(task.id, { note: event.target.value })}
                        placeholder="Skriv kommentar"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
