"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Keyboard } from "lucide-react";
import AppShell from "@/components/AppShell";
import TaskQuickCreate from "@/components/TaskQuickCreate";
import Timeline from "@/components/Timeline";
import TaskCard from "@/components/TaskCard";
import TaskDetailsPanel from "@/components/TaskDetailsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityOrder, useAppStore } from "@/store/useAppStore";
import { addDaysISO, formatDayLong, isToday } from "@/utils/date";
import { CalendarEvent, Task } from "@/models/types";

const statusByKey = {
  "1": "ikke begynt",
  "2": "holder på",
  "3": "står ikke på meg",
  "4": "ferdig"
} as const;

function sortByTime(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });
}

export default function DayView() {
  const customers = useAppStore((state) => state.customers);
  const tasks = useAppStore((state) => state.tasks);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const selectedTaskId = useAppStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useAppStore((state) => state.setSelectedTaskId);
  const updateTask = useAppStore((state) => state.updateTask);
  const copyPlanToTomorrow = useAppStore((state) => state.copyPlanToTomorrow);
  const clearTasks = useAppStore((state) => state.clearTasks);
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [googleAllDay, setGoogleAllDay] = useState<CalendarEvent[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const tasksForDate = useMemo(
    () => tasks.filter((task) => task.date === selectedDate),
    [tasks, selectedDate]
  );
  const tasksWithTime = useMemo(
    () => sortByTime(tasksForDate.filter((task) => task.startTime)),
    [tasksForDate]
  );
  const tasksWithoutTime = useMemo(
    () => tasksForDate.filter((task) => !task.startTime),
    [tasksForDate]
  );
  const sortBacklog = (items: Task[]) =>
    [...items].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.priority);
      const bIndex = priorityOrder.indexOf(b.priority);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.title.localeCompare(b.title);
    });
  const notOnMeTasks = useMemo(
    () => sortBacklog(tasksWithoutTime.filter((task) => task.status === "står ikke på meg")),
    [tasksWithoutTime]
  );
  const backlogTasks = useMemo(
    () => sortBacklog(tasksWithoutTime.filter((task) => task.status !== "står ikke på meg")),
    [tasksWithoutTime]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const statusKey = event.key as keyof typeof statusByKey;
      if (!selectedTaskId || !statusByKey[statusKey]) return;
      updateTask(selectedTaskId, { status: statusByKey[statusKey] });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedTaskId, updateTask]);

  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      setGoogleLoading(true);
      try {
        const res = await fetch(`/api/google/events?date=${selectedDate}`);
        if (!res.ok) {
          setGoogleConnected(false);
          setGoogleEvents([]);
          setGoogleAllDay([]);
          return;
        }
        const data = await res.json();
        if (!active) return;
        const events = (data.events || []).map((event: any) => ({
          id: event.id,
          title: event.summary || "Uten tittel",
          startDateTime: event.start?.dateTime,
          endDateTime: event.end?.dateTime,
          allDay: Boolean(event.start?.date && event.end?.date),
          location: event.location
        }));
        setGoogleConnected(true);
        setGoogleEvents(events.filter((event: CalendarEvent) => event.startDateTime && event.endDateTime));
        setGoogleAllDay(events.filter((event: CalendarEvent) => event.allDay));
      } catch (error) {
        setGoogleConnected(false);
      } finally {
        setGoogleLoading(false);
      }
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const handleCycleStatus = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const cycleOrder = ["ikke begynt", "holder på", "gjort", "ferdig", "står ikke på meg"] as const;
    const index = cycleOrder.indexOf(task.status);
    const next = cycleOrder[(index + 1) % cycleOrder.length];
    updateTask(taskId, { status: next });
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Dagens plan</div>
              <div className="font-display text-2xl">{formatDayLong(selectedDate)}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                <Badge variant={isToday(selectedDate) ? "accent" : "muted"}>
                  {isToday(selectedDate) ? "I dag" : "Valgt dag"}
                </Badge>
                <Badge variant="default">{tasksForDate.length} oppgaver</Badge>
                <Badge variant="default">{tasksWithTime.length} med tid</Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedDate(addDaysISO(selectedDate, -1))}
              >
                <ArrowLeft className="h-4 w-4" />
                Forrige
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(addDaysISO(selectedDate, 1))}
              >
                Neste
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="subtle"
                onClick={() => copyPlanToTomorrow(selectedDate)}
              >
                <Copy className="h-4 w-4" />
                Kopier plan til i morgen
              </Button>
              <Button variant="outline" onClick={() => clearTasks()}>
                Nullstill oppgaver
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Timeline
            tasks={tasksWithTime}
            events={googleEvents}
            customers={customers}
            selectedTaskId={selectedTaskId}
            onSelect={handleSelectTask}
            onStatusClick={handleCycleStatus}
          />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Uten tid i dag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {googleAllDay.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted">Google heldag</div>
                    {googleAllDay.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-text">{event.title}</span>
                          <Badge variant="accent">Google</Badge>
                        </div>
                        {event.location ? <div className="text-xs text-muted">{event.location}</div> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {backlogTasks.length === 0 ? (
                  <p className="text-sm text-muted">Alt med tid. Ingen løse ender.</p>
                ) : (
                  backlogTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      customer={customers.find((c) => c.id === task.customerId)}
                      selected={task.id === selectedTaskId}
                      onSelect={handleSelectTask}
                      onStatusClick={handleCycleStatus}
                    />
                  ))
                )}
                {notOnMeTasks.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                      Står ikke på meg
                    </div>
                    {notOnMeTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        customer={customers.find((c) => c.id === task.customerId)}
                        selected={task.id === selectedTaskId}
                        onSelect={handleSelectTask}
                        onStatusClick={handleCycleStatus}
                      />
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <TaskQuickCreate />

            <Card>
              <CardContent className="flex items-center gap-3 pt-5 text-sm text-muted">
                <Keyboard className="h-4 w-4" />
                1=ikke begynt, 2=holder på, 3=står ikke på meg, 4=ferdig
              </CardContent>
            </Card>

            <div ref={detailsRef}>
              <TaskDetailsPanel />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
