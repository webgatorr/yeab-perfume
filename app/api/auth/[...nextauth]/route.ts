import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: 'admin' | 'staff';
        };
    }
    interface User {
        role?: 'admin' | 'staff';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: 'admin' | 'staff';
    }
}

const authOptions: NextAuthOptions = {
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

                const adminUsername = process.env.ADMIN_USERNAME || 'admin';
                const adminPassword = process.env.ADMIN_PASSWORD || 'yeab2024';

                const staffUsername = process.env.STAFF_USERNAME || 'staff';
                const staffPassword = process.env.STAFF_PASSWORD || 'staff2024';

                if (
                    credentials.username === adminUsername &&
                    credentials.password === adminPassword
                ) {
                    return {
                        id: '1',
                        name: 'Owner',
                        email: 'admin@yeabperfume.com',
                        role: 'admin',
                    };
                }

                if (
                    credentials.username === staffUsername &&
                    credentials.password === staffPassword
                ) {
                    return {
                        id: '2',
                        name: 'Staff',
                        email: 'staff@yeabperfume.com',
                        role: 'staff',
                    };
                }

                return null;
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
