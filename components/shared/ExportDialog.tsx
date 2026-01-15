import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from 'sonner';

interface ExportDialogProps {
    title: string;
    description: string;
    onExport: (format: 'csv' | 'pdf', startDate: string, endDate: string) => Promise<void>;
    trigger?: React.ReactNode;
}

export function ExportDialog({ title, description, onExport, trigger }: ExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);

    const handleExport = async (format: 'csv' | 'pdf') => {
        setLoading(true);
        try {
            if (new Date(startDate) > new Date(endDate)) {
                toast.error("Start date cannot be after end date");
                return;
            }
            await onExport(format, startDate, endDate);
            setIsOpen(false);
            toast.success("Export started");
        } catch (error) {
            console.error(error);
            toast.error("Export failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="h-10 rounded-xl border-slate-200">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date" className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto h-11 rounded-xl border-slate-200 hover:bg-slate-50"
                        onClick={() => handleExport('csv')}
                        disabled={loading}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                        Export CSV
                    </Button>
                    <Button
                        className="w-full sm:w-auto h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => handleExport('pdf')}
                        disabled={loading}
                    >
                        <FileJson className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
