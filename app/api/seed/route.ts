import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';
import { faker } from '@faker-js/faker';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const clean = searchParams.get('clean') === 'true';

        if (clean) {
            await Order.deleteMany({});
            await Transaction.deleteMany({});
        }

        // Generate Orders
        const orders = [];
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const perfumes = ['Oud Wood', 'Rose Prick', 'Tobacco Vanille', 'Lost Cherry', 'Bitter Peach', 'Fabulous'];
        const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
        const orderTakers = ['Amir', 'Sarah', 'John', 'Fatima'];

        // Get the highest existing order number to avoid conflicts if not cleaning
        const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
        let nextOrderNumber = (lastOrder?.orderNumber || 1000) + 1;

        for (let i = 0; i < 50; i++) {
            const status = faker.helpers.arrayElement(statuses);
            const date = faker.date.recent({ days: 30 });

            orders.push({
                orderNumber: nextOrderNumber++,
                date: date,
                whatsappNumber: faker.phone.number(),
                hasCustomText: faker.datatype.boolean(),
                hasCustomImage: faker.datatype.boolean(),
                customTextContent: faker.datatype.boolean() ? faker.lorem.words(3) : undefined,
                amount: faker.number.int({ min: 1, max: 5 }),
                price: faker.number.int({ min: 100, max: 500 }),
                perfumeChoice: faker.helpers.arrayElement(perfumes),
                emirate: faker.helpers.arrayElement(emirates),
                area: faker.location.city(),
                directPhone: faker.phone.number(),
                orderTaker: faker.helpers.arrayElement(orderTakers),
                status: status,
                notes: faker.lorem.sentence(),
                createdAt: date,
                updatedAt: date,
            });
        }

        // Generate Transactions
        const transactions = [];
        const categories = ['Sales', 'Inventory', 'Salary', 'Marketing', 'Rent', 'Utilities'];

        for (let i = 0; i < 50; i++) {
            const type = faker.helpers.arrayElement(['income', 'expense']);
            const date = faker.date.recent({ days: 30 });

            transactions.push({
                type: type,
                amount: faker.number.int({ min: 50, max: 5000 }),
                category: faker.helpers.arrayElement(categories),
                description: faker.finance.transactionDescription(),
                date: date,
                createdBy: faker.helpers.arrayElement(orderTakers),
                createdAt: date,
                updatedAt: date,
            });
        }

        await Order.insertMany(orders);
        await Transaction.insertMany(transactions);

        return NextResponse.json({
            message: 'Data seeded successfully',
            ordersCount: orders.length,
            transactionsCount: transactions.length
        });

    } catch (error) {
        console.error('Error seeding data:', error);
        return NextResponse.json({ error: 'Failed to seed data', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
