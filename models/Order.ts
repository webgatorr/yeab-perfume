import mongoose, { Schema, Model, models } from 'mongoose';

export interface IOrder {
    orderNumber: number;
    date: Date;
    whatsappNumber: string;
    hasCustomText: boolean;
    hasCustomImage: boolean;
    customTextContent?: string;
    amount: number;
    perfumeChoice: string;
    emirate?: string;
    area?: string;
    otherLocation?: string;
    directPhone?: string;
    orderTaker: string;
    receiptNumber?: string;
    couponNumber?: string;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        whatsappNumber: {
            type: String,
            required: true,
        },
        hasCustomText: {
            type: Boolean,
            default: false,
        },
        hasCustomImage: {
            type: Boolean,
            default: false,
        },
        customTextContent: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        perfumeChoice: {
            type: String,
            required: true,
        },
        emirate: {
            type: String,
        },
        area: {
            type: String,
        },
        otherLocation: {
            type: String,
        },
        directPhone: {
            type: String,
        },
        orderTaker: {
            type: String,
            required: true,
        },
        receiptNumber: {
            type: String,
        },
        couponNumber: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending',
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Create index for search functionality
OrderSchema.index({ whatsappNumber: 1 });
OrderSchema.index({ directPhone: 1 });
OrderSchema.index({ orderTaker: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ date: -1 });

const Order: Model<IOrder> = models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
