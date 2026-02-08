import mongoose, { Schema, Model, models } from 'mongoose';

export interface INotification {
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
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        type: {
            type: String,
            enum: ['order', 'inventory', 'finance', 'shipment', 'staff'],
            required: true,
        },
        action: {
            type: String,
            enum: ['create', 'update', 'delete'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        actionBy: {
            type: String,
            required: true,
        },
        actionById: {
            type: String,
        },
        entityId: {
            type: String,
        },
        entityType: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ type: 1 });

// Delete the cached model to ensure we use the updated schema
if (models.Notification) {
    delete models.Notification;
}

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
