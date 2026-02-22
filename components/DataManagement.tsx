"use client";

import { useState, useRef } from "react";
import { Download, Upload, Settings, RefreshCcw, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function DataManagement() {
    const [isOpen, setIsOpen] = useState(false);
    const [importStatus, setImportStatus] = useState<"idle" | "success" | "error" | "cleaned">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resetToSeed = useAppStore((state) => state.resetToSeed);

    const handleRemoveDuplicates = () => {
        try {
            const data = localStorage.getItem("jobbkalender-store");
            if (!data) return;

            const parsed = JSON.parse(data);
            if (!parsed || !parsed.state || !Array.isArray(parsed.state.tasks)) return;

            const tasks = parsed.state.tasks as any[];
            const uniqueTasks: any[] = [];
            const seen = new Set();

            tasks.forEach(task => {
                // Create a unique key based on title and date
                const key = `${task.title.toLowerCase().trim()}|${task.date}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueTasks.push(task);
                }
            });

            // Update store
            parsed.state.tasks = uniqueTasks;
            localStorage.setItem("jobbkalender-store", JSON.stringify(parsed));

            setImportStatus("cleaned");
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (e) {
            console.error("Failed to clean duplicates", e);
            setImportStatus("error");
        }
    };

    const handleExport = () => {
        // Get raw data from localStorage to ensure we get everything persisted
        const data = localStorage.getItem("jobbkalender-store");
        if (!data) return;

        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `jobbkalender-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);

                // Basic validation
                if (!parsed || !parsed.state || !Array.isArray(parsed.state.tasks)) {
                    throw new Error("Ugyldig backup-filformat");
                }

                // Save to localStorage
                localStorage.setItem("jobbkalender-store", content);

                setImportStatus("success");
                // Reload to apply changes after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                console.error("Import failed:", error);
                setImportStatus("error");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm("Er du sikker? Dette sletter alle dine data og legger inn testdata. Dette kan ikke angres.")) {
            resetToSeed();
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Innstillinger og data">
                    <Settings className="h-5 w-5 text-muted hover:text-text" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Data og Innstillinger</DialogTitle>
                    <DialogDescription>
                        Administrer dine data. Du kan eksportere data fra denne enheten og importere dem på en annen.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium leading-none">Flytt data</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={handleExport} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                                <Download className="h-6 w-6" />
                                <span>Eksporter data</span>
                                <span className="text-xs text-muted font-normal">Last ned backup</span>
                            </Button>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImport}
                                />
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    className="flex flex-col gap-2 h-auto py-4 w-full"
                                >
                                    <Upload className="h-6 w-6" />
                                    <span>Importer data</span>
                                    <span className="text-xs text-muted font-normal">Last opp backup</span>
                                </Button>
                            </div>
                        </div>

                        <Button onClick={handleRemoveDuplicates} variant="outline" className="w-full">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Fjern duplikater (Rens opp)
                        </Button>

                        {importStatus === "success" && (
                            <Alert className="bg-success/15 border-success/30 text-success">
                                <Check className="h-4 w-4" />
                                <AlertTitle>Suksess!</AlertTitle>
                                <AlertDescription>Data er importert. Siden lastes på nytt...</AlertDescription>
                            </Alert>
                        )}

                        {importStatus === "cleaned" && (
                            <Alert className="bg-success/15 border-success/30 text-success">
                                <Check className="h-4 w-4" />
                                <AlertTitle>Opprensking ferdig</AlertTitle>
                                <AlertDescription>Duplikater er fjernet.</AlertDescription>
                            </Alert>
                        )}

                        {importStatus === "error" && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Feil</AlertTitle>
                                <AlertDescription>Kunne ikke lese filen. Er du sikker på at det er en gyldig backup?</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-4 border-t pt-4">
                        <h3 className="text-sm font-medium leading-none text-danger">Faresone</h3>
                        <Button variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10 w-full justify-start" onClick={handleReset}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Nullstill til startdata (sletter alt)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
