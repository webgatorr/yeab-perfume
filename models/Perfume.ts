import mongoose, { Schema, Document } from 'mongoose';

export interface IPerfume extends Document {
    name: string;
    description?: string;
    currentStock: number; // Always stored in grams
    minStockLevel: number; // Minimum stock level in grams before alert
    unit: 'g' | 'kg'; // Display unit preference
    costPerGram?: number; // Average cost per gram
    category?: string;
    supplier?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PerfumeSchema = new Schema<IPerfume>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        currentStock: {
            type: Number,
            default: 0,
            min: 0,
        },
        minStockLevel: {
            type: Number,
            default: 100, // 100 grams default
            min: 0,
        },
        unit: {
            type: String,
            enum: ['g', 'kg'],
            default: 'g',
        },
        costPerGram: {
            type: Number,
            min: 0,
        },
        category: {
            type: String,
            trim: true,
        },
        supplier: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual to get stock in display unit
PerfumeSchema.virtual('displayStock').get(function () {
    return this.unit === 'kg' ? this.currentStock / 1000 : this.currentStock;
});

// Virtual to check if low stock
PerfumeSchema.virtual('isLowStock').get(function () {
    return this.currentStock <= this.minStockLevel;
});

export default mongoose.models.Perfume || mongoose.model<IPerfume>('Perfume', PerfumeSchema);
