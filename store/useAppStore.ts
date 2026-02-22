"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Customer, LocationNote, Priority, Status, Task, TaskUpdate } from "@/models/types";
import { createSeedData } from "@/utils/seed";
import { newId } from "@/utils/id";
import { addDaysISO, todayISO, addMonthsISO } from "@/utils/date";
import { addMinutesToTime } from "@/utils/time";

export type AppState = {
  customers: Customer[];
  tasks: Task[];
  locationNotes: LocationNote[];
  selectedDate: string;
  selectedTaskId?: string;
  editingTaskId?: string;
  quickAddCustomerId?: string;
  lastSnapshot?: { customers: Customer[]; tasks: Task[]; timestamp: number };
  resetToSeed: () => void;
  clearTasks: () => void;
  restoreSnapshot: () => boolean;
  upsertLocationNote: (customerId: string, location: string, update: Partial<LocationNote>) => void;
  addCustomer: (input: Omit<Customer, "id" | "createdAt" | "updatedAt">) => void;
  updateCustomer: (id: string, update: Partial<Omit<Customer, "id" | "createdAt">>) => void;
  addTask: (input: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, update: TaskUpdate) => void;
  deleteTask: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTaskId: (id?: string) => void;
  setEditingTaskId: (id?: string) => void;
  setQuickAddCustomerId: (id?: string) => void;
  copyPlanToTomorrow: (date: string) => void;
  rolloverIncompleteTasks: () => number;
  generateRecurringTasks: () => number;
  deduplicateRecurringTasks: () => number;
};

const seed = createSeedData();

const defaultTask = (): Pick<Task, "status" | "priority" | "blockedNow"> => ({
  status: "ikke begynt",
  priority: "Medium",
  blockedNow: false
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      customers: seed.customers,
      tasks: seed.tasks,
      locationNotes: [],
      selectedDate: todayISO(),
      selectedTaskId: undefined,
      editingTaskId: undefined,
      quickAddCustomerId: undefined,
      lastSnapshot: undefined,
      resetToSeed: () =>
        set((state) => ({
          lastSnapshot: {
            customers: state.customers,
            tasks: state.tasks,
            timestamp: Date.now()
          },
          customers: seed.customers,
          tasks: seed.tasks,
          locationNotes: [],
          selectedDate: todayISO(),
          selectedTaskId: undefined,
          quickAddCustomerId: undefined
        })),
      clearTasks: () =>
        set((state) => ({
          lastSnapshot: {
            customers: state.customers,
            tasks: state.tasks,
            timestamp: Date.now()
          },
          tasks: [],
          selectedTaskId: undefined
        })),
      restoreSnapshot: () => {
        const snapshot = get().lastSnapshot;
        if (!snapshot) return false;
        if (Date.now() - snapshot.timestamp > 1000 * 60 * 5) return false;
        set(() => ({
          customers: snapshot.customers,
          tasks: snapshot.tasks,
          selectedTaskId: undefined
        }));
        return true;
      },
      upsertLocationNote: (customerId, location, update) =>
        set((state) => {
          const existing = state.locationNotes.find(
            (note) => note.customerId === customerId && note.location === location
          );
          if (existing) {
            return {
              locationNotes: state.locationNotes.map((note) =>
                note.id === existing.id ? { ...note, ...update } : note
              )
            };
          }
          const now: LocationNote = {
            id: newId("loc"),
            customerId,
            location,
            hasContent: false,
            ...update
          };
          return { locationNotes: [...state.locationNotes, now] };
        }),
      addCustomer: (input) =>
        set((state) => {
          const now = new Date().toISOString();
          const customer: Customer = {
            id: newId("cust"),
            ...input,
            createdAt: now,
            updatedAt: now
          };
          return { customers: [...state.customers, customer] };
        }),
      updateCustomer: (id, update) =>
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id
              ? { ...customer, ...update, updatedAt: new Date().toISOString() }
              : customer
          )
        })),
      addTask: (input) =>
        set((state) => {
          const now = new Date().toISOString();
          const task: Task = {
            id: newId("task"),
            ...defaultTask(),
            ...input,
            createdAt: now,
            updatedAt: now
          };
          if (task.startTime && !task.endTime) {
            task.endTime = addMinutesToTime(task.startTime, 60);
          }
          return { tasks: [...state.tasks, task], selectedTaskId: task.id };
        }),
      updateTask: (id, update) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...update, updatedAt: update.updatedAt ?? new Date().toISOString() }
              : task
          )
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          selectedTaskId: state.selectedTaskId === id ? undefined : state.selectedTaskId
        })),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setEditingTaskId: (id) => set({ editingTaskId: id }),
      setQuickAddCustomerId: (id) => set({ quickAddCustomerId: id }),
      copyPlanToTomorrow: (date) =>
        set((state) => {
          const tomorrow = addDaysISO(date, 1);
          const now = new Date().toISOString();
          const clones = state.tasks
            .filter((task) => task.date === date)
            .map((task) => {
              const status: Status =
                task.status === "gjort" || task.status === "ferdig" ? "holder på" : task.status;
              return {
                ...task,
                id: newId("task"),
                date: tomorrow,
                status,
                createdAt: now,
                updatedAt: now
              };
            });
          return { tasks: [...state.tasks, ...clones], selectedDate: tomorrow };
        }),
      rolloverIncompleteTasks: () => {
        const today = todayISO();
        let rolledOverCount = 0;

        set((state) => {
          const tasksToRollover = state.tasks.filter(
            (task) =>
              task.date < today &&
              task.status !== "gjort" &&
              // Skip recurring tasks — they are handled by generateRecurringTasks
              (!task.recurrence || task.recurrence === "none")
          );

          rolledOverCount = tasksToRollover.length;

          if (rolledOverCount === 0) return {};

          return {
            tasks: state.tasks.map((task) =>
              tasksToRollover.find((t) => t.id === task.id)
                ? { ...task, date: today, updatedAt: new Date().toISOString() }
                : task
            )
          };
        });

        return rolledOverCount;
      },
      generateRecurringTasks: () => {
        const today = todayISO();
        let generatedCount = 0;

        set((state) => {
          // Find recurring tasks dated today or in the past that need processing
          const recurringTasks = state.tasks.filter(
            (task) =>
              task.recurrence &&
              task.recurrence !== "none" &&
              task.date <= today
          );

          const newTasks: Task[] = [];

          recurringTasks.forEach((task) => {
            let nextDate = task.date;

            if (task.recurrence === "daily") {
              // For daily tasks, the next occurrence is always tomorrow
              nextDate = addDaysISO(today, 1);
            } else if (task.recurrence === "weekly") {
              nextDate = addDaysISO(task.date, 7);
            } else if (task.recurrence === "monthly") {
              nextDate = addMonthsISO(task.date, 1);
            }

            // Determine the source ID for deduplication
            const sourceId = task.recurrenceSourceId || task.id;

            // Check if a task already exists on the target date from the same source
            const alreadyExists = state.tasks.some(
              (t) =>
                t.date === nextDate &&
                (t.id === sourceId ||
                  t.recurrenceSourceId === sourceId ||
                  t.recurrenceSourceId === task.id ||
                  t.id === task.id)
            );

            // Also check in the newTasks we just built in this batch
            const alreadyInBatch = newTasks.some(
              (t) => t.date === nextDate && t.recurrenceSourceId === sourceId
            );

            if (alreadyExists || alreadyInBatch) return;

            const newTask: Task = {
              ...task,
              id: newId("task"),
              date: nextDate,
              status: "ikke begynt",
              recurrenceSourceId: sourceId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            newTasks.push(newTask);
          });

          generatedCount = newTasks.length;

          if (generatedCount === 0) return {};

          return { tasks: [...state.tasks, ...newTasks] };
        });

        return generatedCount;
      },
      deduplicateRecurringTasks: () => {
        let removedCount = 0;

        set((state) => {
          const seen = new Map<string, string>(); // key -> first task id
          const idsToRemove = new Set<string>();

          // Sort by createdAt so we keep the oldest one
          const sorted = [...state.tasks].sort(
            (a, b) => a.createdAt.localeCompare(b.createdAt)
          );

          sorted.forEach((task) => {
            if (!task.recurrence || task.recurrence === "none") return;

            // Key: same title + same customer + same date = duplicate
            const key = `${task.title}|${task.customerId}|${task.date}`;

            if (seen.has(key)) {
              idsToRemove.add(task.id);
            } else {
              seen.set(key, task.id);
            }
          });

          removedCount = idsToRemove.size;

          if (removedCount === 0) return {};

          return {
            tasks: state.tasks.filter((t) => !idsToRemove.has(t.id))
          };
        });

        return removedCount;
      }
    }),
    {
      name: "jobbkalender-store",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        customers: state.customers,
        tasks: state.tasks,
        locationNotes: state.locationNotes,
        selectedDate: state.selectedDate,
        selectedTaskId: state.selectedTaskId,
        quickAddCustomerId: state.quickAddCustomerId
      })
    }
  )
);

export const statusOrder: Status[] = ["ikke begynt", "gjort", "holder på", "står ikke på meg", "ferdig"];

export const priorityOrder: Priority[] = ["Høy", "Medium", "Lav"];

export const isCompletedStatus = (status: Status) => status === "gjort" || status === "ferdig";
