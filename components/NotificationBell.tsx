'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearOldNotifications,
        isSubscribed,
        requestPermission,
        isSupported
    } = useNotifications();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleNotificationClick = async (id: string, url?: string) => {
        await markAsRead(id);
        if (url) {
            router.push(url);
            setIsOpen(false);
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'order': return 'text-blue-500 bg-blue-50';
            case 'inventory': return 'text-purple-500 bg-purple-50';
            case 'finance': return 'text-emerald-500 bg-emerald-50';
            case 'shipment': return 'text-amber-500 bg-amber-50';
            case 'staff': return 'text-pink-500 bg-pink-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 mr-4" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                                className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            >
                                Mark all read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {!isSubscribed && isSupported && (
                    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-start gap-3">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-indigo-900">Enable Push Notifications</p>
                            <p className="text-xs text-indigo-700 mt-0.5">Get notified instantly about new orders and updates.</p>
                        </div>
                        <Button size="sm" onClick={requestPermission} className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
                            Enable
                        </Button>
                    </div>
                )}

                <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-12 flex flex-col items-center text-center px-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <Bell className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">No notifications</p>
                            <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notification) => (
                                <button
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification._id, notification.metadata?.url)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 group relative",
                                        !notification.isRead && "bg-slate-50/50"
                                    )}
                                >
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getIconColor(notification.type))}>
                                        <Bell className="w-5 h-5 opacity-75" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn("text-sm font-medium truncate", !notification.isRead ? "text-slate-900" : "text-slate-700")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearOldNotifications}
                        className="w-full text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 h-8 justify-center"
                    >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Clear old notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
