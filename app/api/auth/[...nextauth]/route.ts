import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: 'admin' | 'staff';
            username?: string;
        };
    }
    interface User {
        role?: 'admin' | 'staff';
        username?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: 'admin' | 'staff';
        username?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    await dbConnect();

                    // Find user by username
                    const user = await User.findOne({
                        username: credentials.username.toLowerCase(),
                        isActive: true,
                    });

                    if (!user) {
                        // Fallback to environment variables for initial admin setup
                        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
                        const adminPassword = process.env.ADMIN_PASSWORD || 'yeab2024';

                        if (
                            credentials.username === adminUsername &&
                            credentials.password === adminPassword
                        ) {
                            return {
                                id: 'env-admin',
                                name: 'Owner',
                                email: 'admin@yeabperfume.com',
                                role: 'admin',
                                username: adminUsername,
                            };
                        }
                        return null;
                    }

                    // Compare password
                    const isPasswordValid = await user.comparePassword(credentials.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email || '',
                        role: user.role,
                        username: user.username,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.username = token.username;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
