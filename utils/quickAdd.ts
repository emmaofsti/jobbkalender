import { Customer } from "@/models/types";
import { addMinutesToTime, parseTimeParts, toMinutes } from "@/utils/time";

export type QuickAddResult = {
  title: string;
  customerId?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  cleanedText: string;
};

const rangeRegex = /(\d{1,2})(?:[:.](\d{2}))?\s*[-–]\s*(\d{1,2})(?:[:.](\d{2}))?/;
const singleTimeRegex = /\bkl\.?\s*(\d{1,2})(?:[:.](\d{2}))?\b/i;
const leadingTimeRegex = /^(\d{1,2})(?:[:.](\d{2}))?\b/;

function removeSegment(text: string, segment: string) {
  return text.replace(segment, " ");
}

function findCustomerMatch(text: string, customers: Customer[]) {
  const lowered = text.toLowerCase();
  let best: { id: string; name: string } | null = null;
  for (const customer of customers) {
    const name = customer.name.toLowerCase();
    if (lowered.includes(name)) {
      if (!best || name.length > best.name.length) {
        best = { id: customer.id, name: customer.name };
      }
    }
  }
  return best;
}

export function parseQuickAdd(text: string, customers: Customer[], locationTags: string[] = []): QuickAddResult {
  let working = text.trim();
  let startTime: string | undefined;
  let endTime: string | undefined;

  const rangeMatch = working.match(rangeRegex);
  if (rangeMatch) {
    const start = parseTimeParts(rangeMatch[1], rangeMatch[2]);
    const end = parseTimeParts(rangeMatch[3], rangeMatch[4]);
    if (start) {
      startTime = start;
      if (end) {
        endTime = end;
        if (toMinutes(endTime) <= toMinutes(startTime)) {
          endTime = addMinutesToTime(startTime, 60);
        }
      } else {
        endTime = addMinutesToTime(startTime, 60);
      }
      working = removeSegment(working, rangeMatch[0]);
    }
  } else {
    const singleMatch = working.match(singleTimeRegex) ?? working.match(leadingTimeRegex);
    if (singleMatch) {
      const time = parseTimeParts(singleMatch[1], singleMatch[2]);
      if (time) {
        startTime = time;
        endTime = addMinutesToTime(time, 60);
        working = removeSegment(working, singleMatch[0]);
      }
    }
  }

  let customerId: string | undefined;
  const kundeMatch = working.match(/\b(?:kunde|customer)\s*:\s*([^,\n]+)/i);
  if (kundeMatch) {
    const raw = kundeMatch[1].trim();
    const rawLower = raw.toLowerCase();
    const candidate =
      customers.find((customer) => customer.name.toLowerCase() === rawLower) ??
      customers.find((customer) => rawLower.includes(customer.name.toLowerCase()));
    if (candidate) {
      customerId = candidate.id;
    }
    working = removeSegment(working, kundeMatch[0]);
  }

  if (!customerId) {
    const nameMatch = findCustomerMatch(working, customers);
    if (nameMatch) {
      customerId = nameMatch.id;
      const regex = new RegExp(nameMatch.name, "i");
      working = working.replace(regex, " ");
    }
  }

  let location: string | undefined;
  for (const tag of locationTags) {
    const regex = new RegExp(`\\b${tag}\\b`, "i");
    if (regex.test(working)) {
      location = tag;
      working = working.replace(regex, " ");
      break;
    }
  }

  const cleaned = working
    .replace(/[:;\-–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: cleaned || text.trim(),
    customerId,
    startTime,
    endTime,
    location,
    cleanedText: cleaned
  };
}
