import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import PushSubscription from '@/models/PushSubscription';

// Types for notification payloads
export interface NotificationPayload {
    type: 'order' | 'inventory' | 'finance' | 'shipment' | 'staff';
    action: 'create' | 'update' | 'delete';
    title: string;
    message: string;
    actionBy: string;
    actionById?: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, any>;
}

// Create a notification and send push to admin
export async function createNotification(payload: NotificationPayload): Promise<void> {
    try {
        await dbConnect();

        // Save notification to database
        const notification = await Notification.create({
            ...payload,
            isRead: false,
        });

        // Send push notification to all admin subscriptions
        await sendPushToAdmins({
            title: payload.title,
            body: payload.message,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `${payload.type}-${payload.action}-${notification._id}`,
            data: {
                notificationId: notification._id.toString(),
                type: payload.type,
                action: payload.action,
                entityId: payload.entityId,
                url: getNotificationUrl(payload),
            },
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw - we don't want notification failures to break the main operation
    }
}

// Send push notification to all admin subscriptions
async function sendPushToAdmins(pushPayload: any): Promise<void> {
    try {
        await dbConnect();

        // Get all admin push subscriptions
        const subscriptions = await PushSubscription.find({ userRole: 'admin' }).lean();

        if (subscriptions.length === 0) {
            console.log('No admin push subscriptions found');
            return;
        }

        // Get VAPID keys from environment
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@yeabperfume.com';

        if (!vapidPublicKey || !vapidPrivateKey) {
            console.warn('VAPID keys not configured - skipping push notification');
            return;
        }

        // Dynamic import of web-push since it's a server-side module
        const webPush = await import('web-push');

        webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

        // Send push to all admin subscriptions
        const sendPromises = subscriptions.map(async (sub) => {
            try {
                await webPush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: sub.keys,
                    },
                    JSON.stringify(pushPayload)
                );
            } catch (error: any) {
                // If subscription is expired or invalid, remove it
                if (error.statusCode === 404 || error.statusCode === 410) {
                    console.log('Removing expired push subscription:', sub.endpoint);
                    await PushSubscription.deleteOne({ _id: sub._id });
                } else {
                    console.error('Error sending push to subscription:', error);
                }
            }
        });

        await Promise.all(sendPromises);
    } catch (error) {
        console.error('Error sending push to admins:', error);
    }
}

// Get the URL to navigate to when notification is clicked
function getNotificationUrl(payload: NotificationPayload): string {
    switch (payload.type) {
        case 'order':
            return payload.entityId ? `/orders/${payload.entityId}` : '/orders';
        case 'inventory':
            return '/inventory';
        case 'finance':
            return '/finances';
        case 'shipment':
            return '/inventory';
        case 'staff':
            return '/settings';
        default:
            return '/dashboard';
    }
}

// Helper functions for creating specific notifications
export function notifyOrderCreated(orderNumber: number, actionBy: string, actionById?: string): Promise<void> {
    return createNotification({
        type: 'order',
        action: 'create',
        title: 'New Order Created',
        message: `${actionBy} created order #${orderNumber}`,
        actionBy,
        actionById,
        entityType: 'Order',
        metadata: { orderNumber },
    });
}

export function notifyOrderUpdated(orderNumber: number, changes: string, actionBy: string, orderId?: string, actionById?: string): Promise<void> {
    return createNotification({
        type: 'order',
        action: 'update',
        title: 'Order Updated',
        message: `${actionBy} updated order #${orderNumber}: ${changes}`,
        actionBy,
        actionById,
        entityId: orderId,
        entityType: 'Order',
        metadata: { orderNumber, changes },
    });
}

export function notifyInventoryAdded(perfumeName: string, quantity: number, unit: string, actionBy: string, actionById?: string): Promise<void> {
    return createNotification({
        type: 'inventory',
        action: 'create',
        title: 'Inventory Added',
        message: `${actionBy} added ${quantity} ${unit} of ${perfumeName}`,
        actionBy,
        actionById,
        entityType: 'Perfume',
        metadata: { perfumeName, quantity, unit },
    });
}

export function notifyShipmentCreated(perfumeName: string, type: string, quantity: number, unit: string, actionBy: string, actionById?: string): Promise<void> {
    const action = type === 'incoming' ? 'received' : type === 'outgoing' ? 'shipped' : 'adjusted';
    return createNotification({
        type: 'shipment',
        action: 'create',
        title: `Shipment ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        message: `${actionBy} ${action} ${quantity} ${unit} of ${perfumeName}`,
        actionBy,
        actionById,
        entityType: 'Shipment',
        metadata: { perfumeName, type, quantity, unit },
    });
}

export function notifyTransactionCreated(type: string, amount: number, category: string, actionBy: string, actionById?: string): Promise<void> {
    return createNotification({
        type: 'finance',
        action: 'create',
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Recorded`,
        message: `${actionBy} recorded ${type} of ${amount.toLocaleString()} AED - ${category}`,
        actionBy,
        actionById,
        entityType: 'Transaction',
        metadata: { type, amount, category },
    });
}

export function notifyStaffCreated(staffName: string, actionBy: string, actionById?: string): Promise<void> {
    return createNotification({
        type: 'staff',
        action: 'create',
        title: 'New Staff Added',
        message: `${actionBy} added new staff member: ${staffName}`,
        actionBy,
        actionById,
        entityType: 'User',
        metadata: { staffName },
    });
}
