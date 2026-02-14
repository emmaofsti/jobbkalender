"use client";

import { CalendarEvent, Customer, Task } from "@/models/types";
import { toMinutes, addMinutesToTime, timeFromISO } from "@/utils/time";
import { Badge } from "@/components/ui/badge";
import TaskCard from "@/components/TaskCard";

const startHour = 8;
const endHour = 18;
const hourHeight = 64;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function computeBlock(task: Task) {
  const startTime = task.startTime ?? "08:00";
  const endTime = task.endTime ?? addMinutesToTime(startTime, 60);
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const timelineStart = startHour * 60;
  const timelineEnd = endHour * 60;

  const topMinutes = clamp(startMinutes, timelineStart, timelineEnd) - timelineStart;
  const heightMinutes = clamp(endMinutes, timelineStart, timelineEnd) - clamp(startMinutes, timelineStart, timelineEnd);

  const top = (topMinutes / 60) * hourHeight;
  const height = Math.max((heightMinutes / 60) * hourHeight, 52);

  return { top, height };
}

export default function Timeline({
  tasks,
  events,
  customers,
  selectedTaskId,
  onSelect,
  onStatusClick
}: {
  tasks: Task[];
  events: CalendarEvent[];
  customers: Customer[];
  selectedTaskId?: string;
  onSelect: (id: string) => void;
  onStatusClick: (id: string) => void;
}) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between pb-4">
        <div className="font-display text-lg">Dagens tidslinje</div>
        <div className="text-xs text-muted">08:00–18:00</div>
      </div>
      <div className="relative grid grid-cols-[80px_1fr] gap-4">
        <div className="space-y-6">
          {hours.map((hour) => (
            <div key={hour} className="text-xs text-muted">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        <div className="relative" style={{ height: hourHeight * (endHour - startHour) }}>
          <div className="absolute inset-0 flex flex-col">
            {hours.slice(0, -1).map((hour) => (
              <div
                key={hour}
                className="border-t border-dashed border-border"
                style={{ height: hourHeight }}
              />
            ))}
          </div>
          {events
            .filter((event) => event.startDateTime && event.endDateTime)
            .map((event) => {
              const startTime = timeFromISO(event.startDateTime);
              const endTime = timeFromISO(event.endDateTime);
              const startMinutes = toMinutes(startTime);
              const endMinutes = toMinutes(endTime);
              const timelineStart = startHour * 60;
              const timelineEnd = endHour * 60;
              const topMinutes = clamp(startMinutes, timelineStart, timelineEnd) - timelineStart;
              const heightMinutes =
                clamp(endMinutes, timelineStart, timelineEnd) - clamp(startMinutes, timelineStart, timelineEnd);
              const top = (topMinutes / 60) * hourHeight;
              const height = Math.max((heightMinutes / 60) * hourHeight, 44);

              return (
                <div
                  key={event.id}
                  className="absolute left-0 right-0 pr-4"
                  style={{ top, height }}
                >
                  <div className="rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-text">{event.title}</div>
                      <Badge variant="accent">Google</Badge>
                    </div>
                    <div className="text-xs text-muted">
                      {startTime} – {endTime}
                    </div>
                  </div>
                </div>
              );
            })}
          {tasks.map((task) => {
            const { top, height } = computeBlock(task);
            const customer = customers.find((c) => c.id === task.customerId);
            return (
              <div
                key={task.id}
                className="absolute left-0 right-0 pr-4"
                style={{ top, height }}
              >
                <TaskCard
                  task={task}
                  customer={customer}
                  selected={task.id === selectedTaskId}
                  onSelect={onSelect}
                  onStatusClick={onStatusClick}
                  compact
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
