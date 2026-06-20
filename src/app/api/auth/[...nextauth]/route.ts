import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = (user as Record<string, unknown>).id;
        (session.user as Record<string, unknown>).role = (user as Record<string, unknown>).role;
        (session.user as Record<string, unknown>).plan = (user as Record<string, unknown>).plan;
        (session.user as Record<string, unknown>).credits = (user as Record<string, unknown>).credits;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.user.findUnique({ where: { id: user.id! } });
          if (!existingUser) {
            const userCount = await db.user.count();
            await db.user.update({
              where: { id: user.id! },
              data: { role: userCount === 0 ? "admin" : "user" },
            });
          }
        } catch (err) {
          console.error("signIn callback error:", err);
        }
      }
      return true;
    },
  },
  // NO pages.signIn - prevents redirect loop
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
