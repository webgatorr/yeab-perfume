import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
    perfume: mongoose.Types.ObjectId;
    type: 'incoming' | 'outgoing' | 'adjustment';
    quantity: number; // Always stored in grams
    inputUnit: 'g' | 'kg'; // Original input unit
    inputQuantity: number; // Original input quantity
    costPerUnit?: number; // Cost per input unit
    totalCost?: number;
    supplier?: string;
    notes?: string;
    date: Date;
    createdBy: string;
    createdAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
    {
        perfume: {
            type: Schema.Types.ObjectId,
            ref: 'Perfume',
            required: true,
        },
        type: {
            type: String,
            enum: ['incoming', 'outgoing', 'adjustment'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        inputUnit: {
            type: String,
            enum: ['g', 'kg'],
            required: true,
        },
        inputQuantity: {
            type: Number,
            required: true,
        },
        costPerUnit: {
            type: Number,
            min: 0,
        },
        totalCost: {
            type: Number,
            min: 0,
        },
        supplier: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
ShipmentSchema.index({ perfume: 1, date: -1 });
ShipmentSchema.index({ date: -1 });

export default mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);
