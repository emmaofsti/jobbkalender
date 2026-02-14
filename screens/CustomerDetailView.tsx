"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";

export default function CustomerDetailView() {
  const params = useParams();
  const customerId = String(params?.id || "");
  const customers = useAppStore((state) => state.customers);
  const locationNotes = useAppStore((state) => state.locationNotes);
  const upsertLocationNote = useAppStore((state) => state.upsertLocationNote);

  const customer = customers.find((c) => c.id === customerId);
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
      : customer?.name === "Radisson"
        ? radissonFallback
        : [];

  const notesMap = useMemo(() => {
    const map = new Map<string, typeof locationNotes[number]>();
    locationNotes
      .filter((note) => note.customerId === customerId)
      .forEach((note) => map.set(note.location, note));
    return map;
  }, [locationNotes, customerId]);

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
            <Button variant="outline" asChild>
              <Link href="/customers">Tilbake til kunder</Link>
            </Button>
          </CardContent>
        </Card>

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
      </div>
    </AppShell>
  );
}
