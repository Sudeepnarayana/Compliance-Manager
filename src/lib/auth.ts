import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbService } from './dbService';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }
        
        const user = await dbService.getUserByEmail(credentials.email);
        if (!user) {
          throw new Error('No user found with this email address.');
        }

        if (user.status === 'INACTIVE') {
          throw new Error('Your account has been deactivated. Please contact support.');
        }
        
        const isValid = bcrypt.compareSync(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Incorrect password.');
        }
        
        // Audit log success
        await dbService.createAuditLog({
          userId: user.id,
          action: 'USER_LOGIN',
          resource: 'Auth',
          details: `User ${user.email} logged in successfully.`
        });
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-key-12345678-very-secure',
};
