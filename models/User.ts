import mongoose, { Schema, Model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    _id: string;
    username: string;
    password: string;
    name: string;
    email?: string;
    role: 'admin' | 'staff';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        role: {
            type: String,
            enum: ['admin', 'staff'],
            default: 'staff',
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

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster lookups
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Delete the cached model to ensure we use the updated schema
if (models.User) {
    delete models.User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
