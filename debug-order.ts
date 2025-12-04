import mongoose from 'mongoose';
import Order from './models/Order';
import dbConnect from './lib/mongodb';

async function debug() {
    await dbConnect();
    const order = await Order.findOne().sort({ createdAt: -1 });
    console.log(JSON.stringify(order, null, 2));
    process.exit(0);
}

debug();
