'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid, parseISO } from 'date-fns';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface DateRange {
    from: Date;
    to: Date;
}

interface DateRangePickerProps {
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
    className?: string;
}

const presets = [
    { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { label: 'Last 14 days', getValue: () => ({ from: subDays(new Date(), 13), to: new Date() }) },
    { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
    { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
];

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempFrom, setTempFrom] = useState<string>(format(dateRange.from, 'yyyy-MM-dd'));
    const [tempTo, setTempTo] = useState<string>(format(dateRange.to, 'yyyy-MM-dd'));

    useEffect(() => {
        setTempFrom(format(dateRange.from, 'yyyy-MM-dd'));
        setTempTo(format(dateRange.to, 'yyyy-MM-dd'));
    }, [dateRange]);

    const handleApply = () => {
        const fromDate = parseISO(tempFrom);
        const toDate = parseISO(tempTo);

        if (isValid(fromDate) && isValid(toDate) && fromDate <= toDate) {
            onDateRangeChange({
                from: fromDate,
                to: toDate,
            });
            setIsOpen(false);
        }
    };

    const handlePresetClick = (preset: typeof presets[0]) => {
        const range = preset.getValue();
        onDateRangeChange(range);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm",
                        className
                    )}
                >
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    <span>
                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 space-y-4">
                    {/* Quick Presets */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Select</p>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => handlePresetClick(preset)}
                                    className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-100" />

                    {/* Custom Date Range */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Range</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-600">From</label>
                                <input
                                    type="date"
                                    value={tempFrom}
                                    onChange={(e) => setTempFrom(e.target.value)}
                                    max={tempTo}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-600">To</label>
                                <input
                                    type="date"
                                    value={tempTo}
                                    onChange={(e) => setTempTo(e.target.value)}
                                    min={tempFrom}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={handleApply}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        Apply Range
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
