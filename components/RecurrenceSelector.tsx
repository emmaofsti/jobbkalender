"use client";

import { RecurrenceType } from "@/models/types";
import { Repeat } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function RecurrenceSelector({
    value,
    onChange
}: {
    value?: RecurrenceType;
    onChange: (recurrence: RecurrenceType) => void;
}) {
    const displayText = () => {
        if (!value || value === "none") return "Ingen gjentagelse";
        if (value === "daily") return "🔁 Daglig";
        if (value === "weekly") return "📅 Ukentlig";
        if (value === "monthly") return "📆 Månedlig";
        return "Ingen gjentagelse";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Repeat className="h-3.5 w-3.5" />
                    {displayText()}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem
                    onClick={() => onChange("none")}
                    className={value === "none" || !value ? "bg-accent/10" : ""}
                >
                    Ingen gjentagelse
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onChange("daily")}
                    className={value === "daily" ? "bg-accent/10" : ""}
                >
                    🔁 Gjenta hver dag
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onChange("weekly")}
                    className={value === "weekly" ? "bg-accent/10" : ""}
                >
                    📅 Gjenta ukentlig
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onChange("monthly")}
                    className={value === "monthly" ? "bg-accent/10" : ""}
                >
                    📆 Gjenta månedlig
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
