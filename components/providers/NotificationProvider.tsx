'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';

interface Notification {
    _id: string;
    type: 'order' | 'inventory' | 'finance' | 'shipment' | 'staff';
    action: 'create' | 'update' | 'delete';
    title: string;
    message: string;
    actionBy: string;
    actionById?: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    requestPermission: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearOldNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Only fetch notifications if user is admin
    const { data, error, isLoading } = useSWR(
        isAdmin ? '/api/notifications?limit=20' : null,
        fetcher,
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    );

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    // Check for push support and existing subscription
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && isAdmin) {
            setIsSupported(true);
            setPermission(Notification.permission);

            // Check if already subscribed
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, [isAdmin]);

    // Request permission and subscribe
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            toast.error('Push notifications are not supported in this browser');
            return;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                await subscribeToPush();
            } else {
                toast.error('Permission denied for push notifications');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            toast.error('Failed to request permission');
        }
    }, [isSupported]);

    // Subscribe to push notifications
    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Get VAPID public key
            const res = await fetch('/api/push-subscription/vapid');
            const { publicKey } = await res.json();

            if (!publicKey) {
                toast.error('Push notifications not configured on server');
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            // Subscribe
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            });

            // Send subscription to server
            await fetch('/api/push-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription,
                    userAgent: navigator.userAgent,
                }),
            });

            setIsSubscribed(true);
            toast.success('Successfully subscribed to push notifications');
        } catch (error) {
            console.error('Error subscribing to push:', error);
            toast.error('Failed to subscribe to push notifications');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            mutate(
                '/api/notifications?limit=20',
                (data: any) => {
                    if (!data) return data;
                    return {
                        ...data,
                        notifications: data.notifications.map((n: Notification) =>
                            n._id === id ? { ...n, isRead: true } : n
                        ),
                        unreadCount: Math.max(0, (data.unreadCount || 0) - 1),
                    };
                },
                false
            );

            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [id] }),
            });

            // Revalidate to ensure consistency
            mutate('/api/notifications?limit=20');
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            // Optimistic update
            mutate(
                '/api/notifications?limit=20',
                (data: any) => {
                    if (!data) return data;
                    return {
                        ...data,
                        notifications: data.notifications.map((n: Notification) => ({ ...n, isRead: true })),
                        unreadCount: 0,
                    };
                },
                false
            );

            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true }),
            });

            mutate('/api/notifications?limit=20');
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const clearOldNotifications = async () => {
        try {
            await fetch('/api/notifications', { method: 'DELETE' });
            mutate('/api/notifications?limit=20');
            toast.success('Old notifications cleared');
        } catch (error) {
            console.error('Error clearing old notifications:', error);
            toast.error('Failed to clear notifications');
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                isSupported,
                permission,
                isSubscribed,
                requestPermission,
                markAsRead,
                markAllAsRead,
                clearOldNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
