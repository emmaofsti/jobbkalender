"use client";

import { useMemo, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useAppStore, statusOrder } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Priority, Status } from "@/models/types";
import RecurrenceSelector from "@/components/RecurrenceSelector";
import StatusBadge from "@/components/StatusBadge";
import { addMinutesToTime } from "@/utils/time";

const priorities: Priority[] = ["Lav", "Medium", "Høy"];

export default function TaskModal() {
    const customers = useAppStore((state) => state.customers);
    const tasks = useAppStore((state) => state.tasks);
    const editingTaskId = useAppStore((state) => state.editingTaskId);
    const updateTask = useAppStore((state) => state.updateTask);
    const deleteTask = useAppStore((state) => state.deleteTask);
    const setEditingTaskId = useAppStore((state) => state.setEditingTaskId);

    const task = useMemo(
        () => tasks.find((item) => item.id === editingTaskId),
        [tasks, editingTaskId]
    );

    const close = useCallback(() => setEditingTaskId(undefined), [setEditingTaskId]);

    // Close on Escape key
    useEffect(() => {
        if (!task) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [task, close]);

    if (!task) return null;

    const customer = customers.find((c) => c.id === task.customerId);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={close}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative mx-4 w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl"
                style={{ maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted">Oppgavedetaljer</div>
                        <div className="font-display text-xl text-text">{task.title}</div>
                        <div className="mt-1 text-xs text-muted">{customer?.name ?? "Ukjent kunde"}</div>
                    </div>
                    <button
                        onClick={close}
                        className="rounded-xl p-2 text-muted transition hover:bg-accent/10 hover:text-text"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="modal-title">Tittel</Label>
                        <Input
                            id="modal-title"
                            value={task.title}
                            onChange={(e) => updateTask(task.id, { title: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Kunde</Label>
                            <Select
                                value={task.customerId}
                                onChange={(e) => updateTask(task.id, { customerId: e.target.value })}
                            >
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Dato</Label>
                            <Input
                                type="date"
                                value={task.date}
                                onChange={(e) => updateTask(task.id, { date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Starttid</Label>
                            <Input
                                type="time"
                                value={task.startTime ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value || undefined;
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
                                onChange={(e) => updateTask(task.id, { endTime: e.target.value || undefined })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={task.status}
                                onChange={(e) => updateTask(task.id, { status: e.target.value as Status })}
                            >
                                {statusOrder.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Prioritet</Label>
                            <Select
                                value={task.priority}
                                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                            >
                                {priorities.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Deadline</Label>
                        <Input
                            type="date"
                            value={task.deadline ?? ""}
                            onChange={(e) => updateTask(task.id, { deadline: e.target.value || undefined })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Gjentagelse</Label>
                        <RecurrenceSelector
                            value={task.recurrence}
                            onChange={(recurrence) => {
                                updateTask(task.id, { recurrence });
                                if (recurrence !== "none") {
                                    setTimeout(() => {
                                        useAppStore.getState().generateRecurringTasks();
                                    }, 100);
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Notat</Label>
                        <Textarea
                            value={task.note ?? ""}
                            onChange={(e) => updateTask(task.id, { note: e.target.value })}
                            placeholder="Skriv et notat..."
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                deleteTask(task.id);
                                close();
                            }}
                            className="text-danger"
                        >
                            Slett oppgave
                        </Button>
                        <Button variant="primary" onClick={close}>
                            Lukk
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
