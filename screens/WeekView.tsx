"use client";

import AppShell from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { addDaysISO, formatDayShort, getWeekDays, isToday } from "@/utils/date";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WeekView() {
  const tasks = useAppStore((state) => state.tasks);
  const customers = useAppStore((state) => state.customers);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const setEditingTaskId = useAppStore((state) => state.setEditingTaskId);

  const weekDays = getWeekDays(selectedDate);

  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Ukeoversikt</div>
              <div className="font-display text-2xl">Oversikt per dag</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setSelectedDate(addDaysISO(selectedDate, -7))}>
                <ChevronLeft className="h-4 w-4" />
                Forrige uke
              </Button>
              <Button variant="outline" onClick={() => setSelectedDate(addDaysISO(selectedDate, 7))}>
                Neste uke
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {weekDays.map((day) => {
            const dayTasks = tasks.filter((task) => task.date === day);
            const timed = dayTasks.filter((task) => task.startTime);
            const noTime = dayTasks.filter((task) => !task.startTime);
            return (
              <Card
                key={day}
                className={`transition ${selectedDate === day ? "ring-2 ring-accent/40" : ""}`}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-base">{formatDayShort(day)}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(day)}>
                    Velg dag
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    {isToday(day) ? <Badge variant="accent">I dag</Badge> : null}
                    <Badge variant="default">{dayTasks.length} oppgaver</Badge>
                    <Badge variant="default">{timed.length} med tid</Badge>
                  </div>
                  <div className="space-y-2">
                    {timed.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setEditingTaskId(task.id)}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-xs transition-colors hover:bg-accent/5"
                      >
                        <span className="text-muted">{task.startTime}</span>
                        <span className="text-text">{task.title}</span>
                        <StatusBadge status={task.status} />
                      </div>
                    ))}
                    {timed.length === 0 ? (
                      <div className="text-xs text-muted">Ingen tidssatte oppgaver.</div>
                    ) : null}
                    {timed.length > 4 ? (
                      <div className="text-xs text-muted">+{timed.length - 4} til...</div>
                    ) : null}
                  </div>
                  {noTime.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-xs text-muted">Uten tid:</div>
                      {noTime.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setEditingTaskId(task.id)}
                          className="cursor-pointer rounded-lg px-2 py-1 text-xs text-text transition-colors hover:bg-accent/5"
                        >
                          {task.title}
                        </div>
                      ))}
                      {noTime.length > 3 ? (
                        <div className="text-xs text-muted">+{noTime.length - 3} til...</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-xs text-muted">Uten tid: 0</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
