# Environment Setup Instructions

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/yeab-perfume?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=yeab2024
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier is fine)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string and replace `<password>` with your database password
6. Paste it as the `MONGODB_URI` value

## NextAuth Secret Generation

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and use it as `NEXTAUTH_SECRET`.

## Admin Password

Change the `ADMIN_PASSWORD` to a secure password of your choice.

## For Production (Vercel)

Add all these environment variables in your Vercel project settings:
- Go to your project on Vercel
- Navigate to Settings → Environment Variables
- Add each variable with its production value
- For `NEXTAUTH_URL`, use your production domain (e.g., `https://yeab-perfume.vercel.app`)
