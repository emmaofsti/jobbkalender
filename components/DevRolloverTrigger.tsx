"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

/**
 * DevRolloverTrigger - Development component to test task rollover
 * Exposes the rollover function to the browser console for manual testing
 * Remove this component in production
 */
export default function DevRolloverTrigger() {
    const rolloverIncompleteTasks = useAppStore((state) => state.rolloverIncompleteTasks);
    const generateRecurringTasks = useAppStore((state) => state.generateRecurringTasks);

    useEffect(() => {
        // Expose to window for console access
        (window as any).triggerRollover = () => {
            const count = rolloverIncompleteTasks();
            console.log(`[DevRollover] Rolled over ${count} task(s)`);
            return count;
        };

        (window as any).triggerRecurring = () => {
            const count = generateRecurringTasks();
            console.log(`[DevRollover] Generated ${count} recurring task(s)`);
            return count;
        };

        console.log("[DevRollover] Use window.triggerRollover() to test task rollover");
        console.log("[DevRollover] Use window.triggerRecurring() to test recurring tasks");

        return () => {
            delete (window as any).triggerRollover;
            delete (window as any).triggerRecurring;
        };
    }, [rolloverIncompleteTasks, generateRecurringTasks]);

    return null;
}
