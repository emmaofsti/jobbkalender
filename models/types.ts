export type Status = "ikke begynt" | "gjort" | "holder på" | "står ikke på meg" | "ferdig";
export type Priority = "Lav" | "Medium" | "Høy";

export type Customer = {
  id: string;
  name: string;
  tags: string[];
  contactNote?: string;
  locations?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  customerId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status: Status;
  priority: Priority;
  deadline?: string; // YYYY-MM-DD
  note?: string;
  blockedNote?: string;
  blockedNow?: boolean;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskUpdate = Partial<Omit<Task, "id" | "createdAt">> & {
  updatedAt?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startDateTime?: string; // ISO
  endDateTime?: string; // ISO
  allDay?: boolean;
  location?: string;
};

export type LocationNote = {
  id: string;
  customerId: string;
  location: string;
  hasContent: boolean;
  date?: string;
  comment?: string;
};
