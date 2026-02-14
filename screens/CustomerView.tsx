"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import CustomerCard from "@/components/CustomerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import CustomerSetupModal from "@/components/CustomerSetupModal";
import { useAppStore, isCompletedStatus, priorityOrder } from "@/store/useAppStore";
import { isInSameWeek, todayISO } from "@/utils/date";
import { Priority, Task } from "@/models/types";

const sortOptions = [
  { value: "deadline", label: "Deadline først" },
  { value: "priority", label: "Prioritet" },
  { value: "date", label: "Dato" }
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

function sortTasks(tasks: Task[], sort: SortOption) {
  const sorted = [...tasks];
  if (sort === "deadline") {
    sorted.sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return a.date.localeCompare(b.date);
    });
  }
  if (sort === "priority") {
    sorted.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.priority as Priority);
      const bIndex = priorityOrder.indexOf(b.priority as Priority);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.date.localeCompare(b.date);
    });
  }
  if (sort === "date") {
    sorted.sort((a, b) => a.date.localeCompare(b.date));
  }
  return sorted;
}

export default function CustomerView() {
  const router = useRouter();
  const customers = useAppStore((state) => state.customers);
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const addCustomer = useAppStore((state) => state.addCustomer);
  const updateCustomer = useAppStore((state) => state.updateCustomer);
  const resetToSeed = useAppStore((state) => state.resetToSeed);
  const restoreSnapshot = useAppStore((state) => state.restoreSnapshot);
  const selectedDate = useAppStore((state) => state.selectedDate);

  const [weekOnly, setWeekOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [deadlineOnly, setDeadlineOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("deadline");
  const [setupOpen, setSetupOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (weekOnly && !isInSameWeek(task.date, selectedDate)) return false;
      if (openOnly && isCompletedStatus(task.status)) return false;
      if (blockedOnly && !task.blockedNow) return false;
      if (deadlineOnly && !task.deadline) return false;
      return true;
    });
  }, [tasks, weekOnly, openOnly, blockedOnly, deadlineOnly, selectedDate]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Kunder</div>
              <div className="font-display text-2xl">CRM-light med oppgaver</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="subtle" onClick={() => setSetupOpen(true)}>
                Oppsett kunde
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResetConfirmOpen(true);
                }}
              >
                Reset demo-data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const ok = restoreSnapshot();
                  if (!ok) {
                    window.alert("Ingen reset å angre (eller tidsvinduet er utløpt).");
                  }
                }}
              >
                Angre reset
              </Button>
              <Button
                variant={weekOnly ? "primary" : "outline"}
                onClick={() => setWeekOnly((value) => !value)}
              >
                Denne uken
              </Button>
              <Button
                variant={openOnly ? "primary" : "outline"}
                onClick={() => setOpenOnly((value) => !value)}
              >
                Åpen
              </Button>
              <Button
                variant={blockedOnly ? "primary" : "outline"}
                onClick={() => setBlockedOnly((value) => !value)}
              >
                Blokkert
              </Button>
              <Button
                variant={deadlineOnly ? "primary" : "outline"}
                onClick={() => setDeadlineOnly((value) => !value)}
              >
                Har deadline
              </Button>
              <Select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="card-grid">
          {customers.map((customer) => {
            const customerTasks = filteredTasks.filter((task) => task.customerId === customer.id);
            const allCustomerTasks = tasks.filter((task) => task.customerId === customer.id);
            const sorted = sortTasks(customerTasks, sort);
            return (
              <CustomerCard
                key={customer.id}
                customer={customer}
                tasks={sorted}
                allTasks={allCustomerTasks}
                onQuickAdd={(title) =>
                  addTask({
                    title,
                    customerId: customer.id,
                    date: selectedDate || todayISO()
                  })
                }
                onOpen={() => router.push(`/customers/${customer.id}`)}
              />
            );
          })}
        </div>
      </div>

      <CustomerSetupModal
        open={setupOpen}
        customers={customers}
        onClose={() => setSetupOpen(false)}
        onCreate={(input) => addCustomer(input)}
        onUpdate={(id, update) => updateCustomer(id, update)}
      />

      {resetConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="font-display text-lg">Nullstille demo-data?</div>
            <p className="mt-2 text-sm text-muted">
              Dette erstatter kundene og oppgavene dine. Du kan angre innen 5 minutter.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setResetConfirmOpen(false)}>
                Avbryt
              </Button>
              <Button
                onClick={() => {
                  resetToSeed();
                  setResetConfirmOpen(false);
                }}
              >
                Ja, nullstill
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
