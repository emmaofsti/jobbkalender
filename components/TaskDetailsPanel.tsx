"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { statusOrder } from "@/store/useAppStore";
import { addMinutesToTime } from "@/utils/time";
import { Button } from "@/components/ui/button";
import { Priority, Status } from "@/models/types";

const priorities: Priority[] = ["Lav", "Medium", "Høy"];

export default function TaskDetailsPanel() {
  const customers = useAppStore((state) => state.customers);
  const tasks = useAppStore((state) => state.tasks);
  const selectedTaskId = useAppStore((state) => state.selectedTaskId);
  const updateTask = useAppStore((state) => state.updateTask);
  const deleteTask = useAppStore((state) => state.deleteTask);

  const task = useMemo(
    () => tasks.find((item) => item.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Oppgavedetaljer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Velg en oppgave i listen for å se og redigere detaljer.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oppgavedetaljer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Tittel</Label>
          <Input
            id="title"
            value={task.title}
            onChange={(event) => updateTask(task.id, { title: event.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Kunde</Label>
            <Select
              value={task.customerId}
              onChange={(event) => updateTask(task.id, { customerId: event.target.value })}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dato</Label>
            <Input
              type="date"
              value={task.date}
              onChange={(event) => updateTask(task.id, { date: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Starttid</Label>
            <Input
              type="time"
              value={task.startTime ?? ""}
              onChange={(event) => {
                const value = event.target.value || undefined;
                const updates: { startTime?: string; endTime?: string } = { startTime: value };
                if (value && !task.endTime) {
                  updates.endTime = addMinutesToTime(value, 60);
                }
                updateTask(task.id, updates);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Sluttid</Label>
            <Input
              type="time"
              value={task.endTime ?? ""}
              onChange={(event) => updateTask(task.id, { endTime: event.target.value || undefined })}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={task.status}
              onChange={(event) => updateTask(task.id, { status: event.target.value as Status })}
            >
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prioritet</Label>
            <Select
              value={task.priority}
              onChange={(event) => updateTask(task.id, { priority: event.target.value as Priority })}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={task.deadline ?? ""}
              onChange={(event) => updateTask(task.id, { deadline: event.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label>Plassering / avdeling</Label>
            <Input
              value={task.location ?? ""}
              onChange={(event) => updateTask(task.id, { location: event.target.value || undefined })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Notat</Label>
          <Textarea
            value={task.note ?? ""}
            onChange={(event) => updateTask(task.id, { note: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Blokkert / avhengighet</Label>
          <Textarea
            value={task.blockedNote ?? ""}
            onChange={(event) => updateTask(task.id, { blockedNote: event.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            pressed={Boolean(task.blockedNow)}
            onClick={() => updateTask(task.id, { blockedNow: !task.blockedNow })}
          />
          <span className="text-sm">Blokkerer meg nå</span>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => deleteTask(task.id)}
          >
            Slett oppgave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
