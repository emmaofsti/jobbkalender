"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAppStore, isCompletedStatus } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import StatusBadge from "@/components/StatusBadge";
import { Task } from "@/models/types";

export default function CustomerDetailView() {
  const params = useParams();
  const customerId = String(params?.id || "");
  const customers = useAppStore((state) => state.customers);
  const tasks = useAppStore((state) => state.tasks);
  const locationNotes = useAppStore((state) => state.locationNotes);
  const upsertLocationNote = useAppStore((state) => state.upsertLocationNote);
  const updateCustomer = useAppStore((state) => state.updateCustomer);
  const setEditingTaskId = useAppStore((state) => state.setEditingTaskId);

  const [showCompleted, setShowCompleted] = useState(false);

  const customer = customers.find((c) => c.id === customerId);
  const isRadisson = customer?.name === "Radisson";

  const radissonFallback = [
    "Stavanger",
    "Trondheim",
    "Bergen",
    "Tromsø",
    "RED city centre",
    "RED Airport",
    "Conferance Airport"
  ];
  const locations =
    customer?.locations && customer.locations.length > 0
      ? customer.locations
      : isRadisson
        ? radissonFallback
        : [];

  const notesMap = useMemo(() => {
    const map = new Map<string, typeof locationNotes[number]>();
    locationNotes
      .filter((note) => note.customerId === customerId)
      .forEach((note) => map.set(note.location, note));
    return map;
  }, [locationNotes, customerId]);

  const customerTasks = useMemo(() => {
    return tasks.filter((task) => task.customerId === customerId);
  }, [tasks, customerId]);

  const openTasks = customerTasks.filter((task) => !isCompletedStatus(task.status));
  const completedTasks = customerTasks.filter((task) => isCompletedStatus(task.status));

  const displayTasks = showCompleted ? completedTasks : openTasks;

  if (!customer) {
    return (
      <AppShell>
        <Card>
          <CardContent className="pt-5">Fant ikke kunden.</CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Kundeoversikt</div>
              <div className="font-display text-2xl">{customer.name}</div>
            </div>
            <Link href="/customers">
              <Button variant="outline">Tilbake til kunder</Button>
            </Link>
          </CardContent>
        </Card>

        {!isRadisson && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Oppgaver ({showCompleted ? completedTasks.length : openTasks.length})</CardTitle>
                <Button
                  variant={showCompleted ? "outline" : "primary"}
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  {showCompleted ? "Vis åpne" : "Vis fullførte"}
                </Button>
              </CardHeader>
              <CardContent>
                {displayTasks.length === 0 ? (
                  <div className="text-sm text-muted">
                    {showCompleted ? "Ingen fullførte oppgaver" : "Ingen åpne oppgaver"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex cursor-pointer items-start justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:shadow-soft"
                        onClick={() => setEditingTaskId(task.id)}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{task.title}</div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span>📅 {task.date}</span>
                            {task.startTime && <span>🕐 {task.startTime}</span>}
                            {task.deadline && <span>⏰ Deadline: {task.deadline}</span>}
                            {task.priority && (
                              <span className={task.priority === "Høy" ? "text-danger" : ""}>
                                {task.priority}
                              </span>
                            )}
                            {task.location && <span>📍 {task.location}</span>}
                          </div>
                          {task.note && <div className="text-sm text-muted">{task.note}</div>}
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kommentarer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Kundenotat</Label>
                  <Textarea
                    value={customer.contactNote ?? ""}
                    onChange={(event) =>
                      updateCustomer(customerId, { contactNote: event.target.value })
                    }
                    placeholder="Legg til notater om kunden her..."
                    rows={5}
                  />
                  <div className="text-xs text-muted">
                    Bruk dette feltet til å legge ved viktige notater, kontaktinformasjon eller kommentarer om kunden.
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isRadisson && (
          <Card>
            <CardHeader>
              <CardTitle>Hoteller / lokasjoner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.length === 0 ? (
                <div className="text-sm text-muted">Ingen lokasjoner lagt inn for denne kunden.</div>
              ) : (
                <div className="grid gap-3">
                  <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_2fr] gap-3 text-xs uppercase tracking-[0.2em] text-muted">
                    <span>Hotell</span>
                    <span>Content</span>
                    <span>Dato</span>
                    <span>Kommentar</span>
                  </div>
                  {locations.map((location) => {
                    const note = notesMap.get(location);
                    const hasContent = note?.hasContent ?? false;
                    return (
                      <div
                        key={location}
                        className="grid grid-cols-[1.4fr_0.7fr_0.8fr_2fr] items-start gap-3 rounded-2xl border border-border bg-card p-3"
                      >
                        <div className="text-sm font-medium text-text">{location}</div>
                        <div>
                          <Toggle
                            pressed={hasContent}
                            onClick={() =>
                              upsertLocationNote(customerId, location, {
                                hasContent: !hasContent,
                                date: !hasContent ? note?.date : undefined,
                                comment: !hasContent ? note?.comment : undefined
                              })
                            }
                          />
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={note?.date ?? ""}
                            onChange={(event) =>
                              upsertLocationNote(customerId, location, { date: event.target.value })
                            }
                            disabled={!hasContent}
                          />
                        </div>
                        <div>
                          <Label className="sr-only">Kommentar</Label>
                          <Textarea
                            value={note?.comment ?? ""}
                            onChange={(event) =>
                              upsertLocationNote(customerId, location, { comment: event.target.value })
                            }
                            placeholder="Kommentar"
                            disabled={!hasContent}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
