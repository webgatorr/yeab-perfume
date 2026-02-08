import mongoose, { Schema, Model, models } from 'mongoose';

export interface IPushSubscription {
    _id: string;
    userId: string;
    userRole: 'admin' | 'staff';
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
    {
        userId: {
            type: String,
            required: true,
        },
        userRole: {
            type: String,
            enum: ['admin', 'staff'],
            required: true,
        },
        endpoint: {
            type: String,
            required: true,
            unique: true,
        },
        keys: {
            p256dh: {
                type: String,
                required: true,
            },
            auth: {
                type: String,
                required: true,
            },
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
PushSubscriptionSchema.index({ userId: 1 });
PushSubscriptionSchema.index({ userRole: 1 });

// Delete the cached model to ensure we use the updated schema
if (models.PushSubscription) {
    delete models.PushSubscription;
}

const PushSubscription: Model<IPushSubscription> = mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
