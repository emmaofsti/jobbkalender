"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Customer } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CustomerSetupModal({
  open,
  customers,
  onClose,
  onCreate,
  onUpdate
}: {
  open: boolean;
  customers: Customer[];
  onClose: () => void;
  onCreate: (input: { name: string; tags: string[]; contactNote?: string }) => void;
  onUpdate: (id: string, update: { name: string; tags: string[]; contactNote?: string }) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedId) || null,
    [customers, selectedId]
  );

  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [note, setNote] = useState("");

  const applySelected = (customer: Customer | null) => {
    if (!customer) {
      setName("");
      setTags("");
      setNote("");
      return;
    }
    setName(customer.name);
    setTags(customer.tags.join(", "));
    setNote(customer.contactNote || "");
  };

  const handleSelect = (value: string) => {
    if (value === "new") {
      setSelectedId("new");
      applySelected(null);
      return;
    }
    setSelectedId(value);
    applySelected(customers.find((customer) => customer.id === value) || null);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (selectedId === "new") {
      onCreate({ name: trimmed, tags: tagList, contactNote: note.trim() || undefined });
      setName("");
      setTags("");
      setNote("");
      return;
    }

    onUpdate(selectedId, { name: trimmed, tags: tagList, contactNote: note.trim() || undefined });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="font-display text-xl">Oppsett kunde</div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Velg kunde</Label>
            <select
              className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm shadow-sm"
              value={selectedId}
              onChange={(event) => handleSelect(event.target.value)}
            >
              <option value="new">Ny kunde</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Navn</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Kundenavn" />
          </div>

          <div className="space-y-2">
            <Label>Tagger (kommaseparert)</Label>
            <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Bergen, Stavanger" />
          </div>

          <div className="space-y-2">
            <Label>Kontakt/notat</Label>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kontaktinfo" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted">Endringer lagres i LocalStorage.</div>
            <Button onClick={handleSave}>{selectedId === "new" ? "Opprett kunde" : "Lagre endringer"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
