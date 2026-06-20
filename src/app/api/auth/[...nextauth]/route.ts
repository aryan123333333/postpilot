import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

/* ────────────────────────────────────────────────────────────── */
/*  JWT Sessions — no database sessions, no cookie proxy issues   */
/*  User data (credits, plan) stored in encrypted token in cookie  */
/* ────────────────────────────────────────────────────────────── */

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // First time sign in — create user in DB if needed, load their data into token
      if (account && user) {
        try {
          // Upsert user in database
          const existing = await db.user.findUnique({ where: { email: user.email! } });
          if (!existing) {
            // First user ever = admin
            const userCount = await db.user.count();
            await db.user.create({
              data: {
                id: user.id,
                name: user.name,
                email: user.email!,
                image: user.image,
                role: userCount === 0 ? "admin" : "user",
              },
            });
          }
          // Fetch full user data from DB (credits, plan, role)
          const dbUser = await db.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, plan: true, credits: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.plan = dbUser.plan;
            token.credits = dbUser.credits;
          }
        } catch (err) {
          console.error("jwt callback error:", err);
          // Fallback: still set basic info
          token.id = user.id;
        }
      }

      // On subsequent requests, refresh credits from DB so deductions show up
      if (token.email && !account) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
            select: { credits: true, plan: true, role: true },
          });
          if (dbUser) {
            token.credits = dbUser.credits;
            token.plan = dbUser.plan;
            token.role = dbUser.role;
          }
        } catch {
          // DB down — use cached token values
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).plan = token.plan;
        (session.user as Record<string, unknown>).credits = token.credits;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Allow all Google sign-ins
      if (account?.provider === "google") return true;
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
