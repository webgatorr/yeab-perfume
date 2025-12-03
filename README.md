# Yeab Perfume - Order & Expense Management System

A modern, full-stack web application for managing perfume orders and tracking business finances.

## Features

### Order Management
- ✅ Create, edit, and delete orders
- ✅ Auto-incrementing order numbers
- ✅ Track custom text and image requirements
- ✅ Advanced search by order number, phone, perfume type
- ✅ Filter by status, emirate, order taker
- ✅ Pagination for large datasets
- ✅ Mobile-responsive interface

### Financial Tracking
- ✅ Record income and expenses
- ✅ Category-based organization
- ✅ Interactive charts and visualizations
- ✅ Monthly trends analysis
- ✅ Real-time profit/loss calculations

### Authentication
- ✅ Secure login system
- ✅ Protected routes
- ✅ Session management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Deployment**: Vercel + MongoDB Atlas

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
cd yeab-perfume
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - See `ENV_SETUP.md` for detailed instructions
   - Create `.env.local` file with required variables

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

- Username: `admin`
- Password: (set in your `.env.local` file)

## Project Structure

```
yeab-perfume/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── orders/       # Order management
│   │   └── transactions/ # Financial tracking
│   ├── orders/           # Order pages
│   ├── finances/         # Financial pages
│   ├── login/            # Login page
│   └── page.tsx          # Dashboard
├── components/
│   ├── orders/           # Order components
│   ├── Navbar.tsx        # Navigation
│   └── Providers.tsx     # Session provider
├── lib/
│   └── mongodb.ts        # Database connection
└── models/
    ├── Order.ts          # Order schema
    └── Transaction.ts    # Transaction schema
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### MongoDB Atlas

1. Create a cluster on MongoDB Atlas
2. Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for all IPs)
3. Copy connection string to `MONGODB_URI` environment variable

## Usage

### Creating Orders

1. Navigate to Orders → New Order
2. Fill in all required fields:
   - Date, WhatsApp number, perfume choice, amount
   - Optional: custom text/image, location, coupon
3. Click "Create Order"

### Managing Finances

1. Go to Financial Tracking
2. Click "Add Transaction"
3. Select type (income/expense), category, amount
4. View charts and summaries

### Searching Orders

- Use the search bar to find orders by:
  - Order number
  - Phone numbers
  - Perfume type
  -    content
- Apply filters for status and location

## License

Private - Yeab Perfume Business Use Only
