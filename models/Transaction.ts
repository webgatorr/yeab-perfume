import mongoose, { Schema, Model, models } from 'mongoose';

export interface ITransaction {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        type: {
            type: String,
            enum: ['income', 'expense'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
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

// Create indexes for filtering and sorting
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ category: 1 });

const Transaction: Model<ITransaction> = models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
