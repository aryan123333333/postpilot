import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as Record<string, unknown>).role = (user as Record<string, unknown>).role;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Auto-assign admin role for demo (first user becomes admin)
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({ where: { id: user.id! } });
        if (!existingUser) {
          // First user to sign up becomes admin
          const userCount = await db.user.count();
          await db.user.update({
            where: { id: user.id! },
            data: { role: userCount === 0 ? "admin" : "user" },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET || "postpilot-dev-secret-change-in-production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
