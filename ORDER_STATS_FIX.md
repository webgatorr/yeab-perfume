# Order Statistics - Canceled Orders Fix

## Issue
Canceled orders were being counted in revenue calculations, which was incorrect. Canceled orders should be counted in the total order count and shown separately, but their amounts should NOT be included in revenue calculations.

## Changes Made

### 1. Summary Statistics (`app/api/orders/stats/route.ts`)
- **Before**: `totalRevenue: { $sum: '$amount' }` - counted ALL orders including canceled
- **After**: Revenue now excludes canceled orders using conditional logic:
  ```javascript
  totalRevenue: {
      $sum: {
          $cond: [
              { $ne: ['$status', 'canceled'] },
              '$amount',
              0
          ]
      }
  }
  ```

### 2. Trends Over Time
- **Before**: Revenue included canceled orders
- **After**: Revenue calculation now excludes canceled orders in the time series data

### 3. Top Products
- **Before**: Counted all orders including canceled ones
- **After**: Explicitly excludes canceled orders: `{ $match: { ...query, status: { $ne: 'canceled' } } }`

## What Still Counts Canceled Orders
- **Total Orders**: Still includes canceled orders (correct)
- **Canceled Orders Card**: Shows count of canceled orders (correct)
- **Order Volume Chart**: Shows all orders including canceled (correct - shows activity)
- **Location Stats**: Shows all orders including canceled (correct - shows demand)

## What Now Excludes Canceled Orders
- **Total Revenue**: Only counts revenue from pending and delivered orders
- **Revenue in Trends**: Time series revenue excludes canceled orders
- **Top Products**: Only counts non-canceled orders

## Result
The dashboard now correctly shows:
- Total orders (including canceled)
- Canceled orders count (separate card)
- Revenue that excludes canceled orders (accurate financial data)
