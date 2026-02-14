import { addDays, format, isSameDay, parseISO, startOfWeek, isWithinInterval } from "date-fns";
import { nb } from "date-fns/locale";

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDayLong(dateIso: string) {
  return format(parseISO(dateIso), "EEEE d. MMMM", { locale: nb });
}

export function formatDayShort(dateIso: string) {
  return format(parseISO(dateIso), "EEE d. MMM", { locale: nb });
}

export function formatDayNumber(dateIso: string) {
  return format(parseISO(dateIso), "d. MMM", { locale: nb });
}

export function addDaysISO(dateIso: string, amount: number) {
  return format(addDays(parseISO(dateIso), amount), "yyyy-MM-dd");
}

export function isToday(dateIso: string) {
  return isSameDay(parseISO(dateIso), new Date());
}

export function getWeekDays(dateIso: string) {
  const start = startOfWeek(parseISO(dateIso), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(start, index), "yyyy-MM-dd")
  );
}

export function isInSameWeek(dateIso: string, anchorIso: string) {
  const start = startOfWeek(parseISO(anchorIso), { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return isWithinInterval(parseISO(dateIso), { start, end });
}
