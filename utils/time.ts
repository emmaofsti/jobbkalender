const pad = (value: number) => String(value).padStart(2, "0");

export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(minutes: number) {
  const clamped = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${pad(h)}:${pad(m)}`;
}

export function addMinutesToTime(time: string, minutes: number) {
  return fromMinutes(toMinutes(time) + minutes);
}

export function normalizeTimeInput(hours: number, mins: number) {
  if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
  if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
  return `${pad(hours)}:${pad(mins)}`;
}

export function parseTimeParts(hoursRaw: string, minutesRaw?: string) {
  const hours = Number(hoursRaw);
  const mins = minutesRaw ? Number(minutesRaw) : 0;
  return normalizeTimeInput(hours, mins);
}

export function formatTimeLabel(time?: string) {
  if (!time) return "";
  return time;
}

export function timeFromISO(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
