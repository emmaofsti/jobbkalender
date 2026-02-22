"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const ROLLOVER_KEY = "jobbkalender-last-rollover";

/**
 * TaskRolloverScheduler - Automatically moves incomplete tasks to today on app load
 * 
 * When the app opens, checks if rollover has already run today (via localStorage).
 * If not, moves all incomplete tasks from past dates to today and generates
 * any recurring tasks that are due.
 */
export default function TaskRolloverScheduler() {
    const rolloverIncompleteTasks = useAppStore((state) => state.rolloverIncompleteTasks);
    const generateRecurringTasks = useAppStore((state) => state.generateRecurringTasks);
    const deduplicateRecurringTasks = useAppStore((state) => state.deduplicateRecurringTasks);

    useEffect(() => {
        // Always deduplicate on load to clean up any existing duplicates
        const deduped = deduplicateRecurringTasks();
        if (deduped > 0) {
            console.log(`[TaskRollover] Removed ${deduped} duplicate recurring task(s)`);
        }

        const today = new Date().toISOString().split("T")[0];
        const lastRollover = localStorage.getItem(ROLLOVER_KEY);

        if (lastRollover === today) {
            return; // Already ran today
        }

        console.log("[TaskRollover] Running automatic rollover on app load");
        const count = rolloverIncompleteTasks();
        console.log(`[TaskRollover] Moved ${count} incomplete task(s) to today`);

        const generatedCount = generateRecurringTasks();
        console.log(`[TaskRollover] Generated ${generatedCount} recurring task(s)`);

        localStorage.setItem(ROLLOVER_KEY, today);
    }, [rolloverIncompleteTasks, generateRecurringTasks, deduplicateRecurringTasks]);

    // This component doesn't render anything
    return null;
}
