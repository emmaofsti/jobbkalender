"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Priority, Status, RecurrenceType } from "@/models/types";
import RecurrenceSelector from "@/components/RecurrenceSelector";

const priorities: Priority[] = ["Lav", "Medium", "Høy"];
const statuses: Status[] = ["ikke begynt", "gjort", "holder på", "står ikke på meg", "ferdig"];

export default function TaskQuickCreate() {
  const customers = useAppStore((state) => state.customers);
  const addTask = useAppStore((state) => state.addTask);
  const selectedDate = useAppStore((state) => state.selectedDate);

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<Status>("ikke begynt");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [note, setNote] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim() && customerId, [title, customerId]);

  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  const handleSubmit = () => {
    if (!title.trim() || !customerId) {
      setError("Legg inn tittel og velg kunde.");
      return;
    }
    setError(null);
    const resolvedDate = date || selectedDate;
    addTask({
      title: title.trim(),
      customerId,
      date: resolvedDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      status,
      priority,
      note: note.trim() || undefined,
      recurrence
    });

    // Immediately generate next recurring task if recurrence is set
    if (recurrence !== "none") {
      setTimeout(() => {
        useAppStore.getState().generateRecurringTasks();
        console.log("[TaskQuickCreate] Generated recurring task immediately");
      }, 100);
    }

    setTitle("");
    setStartTime("");
    setEndTime("");
    setNote("");
    setRecurrence("none");
    setDate(resolvedDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legg til oppgave</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tittel</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Oppgavetittel" />
        </div>
        <div className="space-y-2">
          <Label>Kunde</Label>
          <Select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Velg kunde</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Dato</Label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onChange={(event) => setStatus(event.target.value as Status)}>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Starttid</Label>
            <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sluttid</Label>
            <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Prioritet</Label>
            <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gjentagelse</Label>
          <RecurrenceSelector value={recurrence} onChange={setRecurrence} />
        </div>
        <div className="space-y-2">
          <Label>Notat</Label>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Notat" />
        </div>
        <Button onClick={handleSubmit} className="w-full">
          <Plus className="h-4 w-4" />
          Legg til oppgave
        </Button>
        {error ? <div className="text-xs text-danger">{error}</div> : null}
      </CardContent>
    </Card>
  );
}
