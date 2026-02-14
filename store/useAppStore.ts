"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Customer, LocationNote, Priority, Status, Task, TaskUpdate } from "@/models/types";
import { createSeedData } from "@/utils/seed";
import { newId } from "@/utils/id";
import { addDaysISO, todayISO } from "@/utils/date";
import { addMinutesToTime } from "@/utils/time";

export type AppState = {
  customers: Customer[];
  tasks: Task[];
  locationNotes: LocationNote[];
  selectedDate: string;
  selectedTaskId?: string;
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
  setQuickAddCustomerId: (id?: string) => void;
  copyPlanToTomorrow: (date: string) => void;
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
        })
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
