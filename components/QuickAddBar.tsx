"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseQuickAdd } from "@/utils/quickAdd";

export default function QuickAddBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const customers = useAppStore((state) => state.customers);
  const addTask = useAppStore((state) => state.addTask);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const quickAddCustomerId = useAppStore((state) => state.quickAddCustomerId);
  const setQuickAddCustomerId = useAppStore((state) => state.setQuickAddCustomerId);

  const locationTags = useMemo(
    () => Array.from(new Set(customers.flatMap((customer) => customer.tags))),
    [customers]
  );

  const parsed = useMemo(
    () => parseQuickAdd(value, customers, locationTags),
    [value, customers, locationTags]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "/") return;
      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || (active as HTMLElement).isContentEditable);
      if (isTyping) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = () => {
    setError(null);
    if (!value.trim()) return;

    const customerId = quickAddCustomerId ?? parsed.customerId;
    if (!customerId) {
      setError("Mangler kunde. Velg i listen eller skriv kundenavn i teksten.");
      return;
    }

    if (!parsed.title) {
      setError("Skriv inn en oppgavetittel.");
      return;
    }

    addTask({
      title: parsed.title,
      customerId,
      date: selectedDate,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      location: parsed.location
    });

    setValue("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg">Quick add</div>
          <p className="text-xs text-muted">Skriv: 13-14 Waynor: artikkel. Bruk / for å fokusere.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Wand2 className="h-4 w-4" />
          Parser tid + kunde + tittel automatisk
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_120px]">
        <Input
          ref={inputRef}
          placeholder="13-14 Waynor: artikkel"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Select
          value={quickAddCustomerId ?? ""}
          onChange={(event) => setQuickAddCustomerId(event.target.value || undefined)}
        >
          <option value="">Auto-kunde</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>
        <Button onClick={handleSubmit} className="w-full">
          <Plus className="h-4 w-4" />
          Legg til
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        {parsed.startTime ? (
          <Badge variant="accent">{parsed.startTime + (parsed.endTime ? `–${parsed.endTime}` : "")}</Badge>
        ) : null}
        {parsed.customerId ? (
          <Badge variant="default">
            {customers.find((c) => c.id === parsed.customerId)?.name ?? ""}
          </Badge>
        ) : null}
        {parsed.location ? <Badge variant="muted">{parsed.location}</Badge> : null}
        {parsed.title ? <Badge variant="default">{parsed.title}</Badge> : null}
        {error ? <span className="text-danger">{error}</span> : null}
      </div>
    </div>
  );
}
