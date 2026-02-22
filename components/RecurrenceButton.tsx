"use client";

import { useAppStore } from "@/store/useAppStore";
import { RecurrenceType } from "@/models/types";
import { Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function RecurrenceButton({
    taskId,
    currentRecurrence
}: {
    taskId: string;
    currentRecurrence?: RecurrenceType;
}) {
    const updateTask = useAppStore((state) => state.updateTask);
    const generateRecurringTasks = useAppStore((state) => state.generateRecurringTasks);

    const handleRecurrenceChange = (recurrence: RecurrenceType) => {
        updateTask(taskId, { recurrence });

        // Immediately generate next task if setting recurrence (not removing it)
        if (recurrence !== "none") {
            // Small delay to ensure state is updated
            setTimeout(() => {
                const count = generateRecurringTasks();
                console.log(`[RecurrenceButton] Generated ${count} recurring task(s) immediately`);
            }, 100);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Gjentagelse</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <DropdownMenuItem
                    onClick={() => handleRecurrenceChange("none")}
                    className={currentRecurrence === "none" || !currentRecurrence ? "bg-accent/10" : ""}
                >
                    Ingen gjentagelse
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRecurrenceChange("daily")}
                    className={currentRecurrence === "daily" ? "bg-accent/10" : ""}
                >
                    🔁 Gjenta hver dag
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRecurrenceChange("weekly")}
                    className={currentRecurrence === "weekly" ? "bg-accent/10" : ""}
                >
                    📅 Gjenta ukentlig
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRecurrenceChange("monthly")}
                    className={currentRecurrence === "monthly" ? "bg-accent/10" : ""}
                >
                    📆 Gjenta månedlig
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
