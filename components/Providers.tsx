'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from './providers/ToastProvider';
import { NotificationProvider } from './providers/NotificationProvider';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider />
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </SessionProvider>
    );
}
