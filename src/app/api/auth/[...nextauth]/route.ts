import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

/* ────────────────────────────────────────────────────────────── */
/*  JWT Sessions — no database sessions, no cookie proxy issues   */
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
      // First time sign in — link Google account to DB user
      if (account && user) {
        try {
          const existing = await db.user.findUnique({ where: { email: user.email! } });
          if (existing) {
            // Update name/image if changed
            await db.user.update({
              where: { email: user.email! },
              data: { name: user.name, image: user.image },
            });
          } else {
            // New user — first user = admin
            const userCount = await db.user.count();
            await db.user.create({
              data: {
                name: user.name,
                email: user.email!,
                image: user.image,
                role: userCount === 0 ? "admin" : "user",
                plan: "free",
                credits: 20,
              },
            });
          }
          // Load user data into token
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
          token.id = user.id;
        }
      }

      // Subsequent requests — refresh credits/plan from DB
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
      if (account?.provider === "google") return true;
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
