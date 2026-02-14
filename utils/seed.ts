import { Customer, Task } from "@/models/types";
import { addDaysISO, todayISO } from "@/utils/date";
import { newId } from "@/utils/id";

export function createSeedData() {
  const now = new Date().toISOString();
  const customers: Customer[] = [
    {
      id: newId("cust"),
      name: "Radisson",
      tags: ["Bergen"],
      contactNote: "Driftsteam + markedsansvarlig. Kort svartid.",
      locations: [
        "Stavanger",
        "Trondheim",
        "Bergen",
        "Tromsø",
        "RED city centre",
        "RED Airport",
        "Conferance Airport"
      ],
      createdAt: now,
      updatedAt: now
    },
    {
      id: newId("cust"),
      name: "Waynor",
      tags: ["Stavanger"],
      contactNote: "Kari + Lars. Liker kjappe statusoppdateringer.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: newId("cust"),
      name: "Sport1",
      tags: ["Trondheim"],
      contactNote: "Sesongtopp, rask respons.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: newId("cust"),
      name: "Internt",
      tags: ["Intern"],
      contactNote: "Oppgaver som kun gjelder interne leveranser.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: newId("cust"),
      name: "Annet",
      tags: ["Diverse"],
      contactNote: "Alt som ikke passer i de faste kundene.",
      createdAt: now,
      updatedAt: now
    }
  ];

  const [radisson, waynor, sport1, internt, annet] = customers;
  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);
  const later = addDaysISO(today, 3);

  const tasks: Task[] = [];

  return { customers, tasks };
}
