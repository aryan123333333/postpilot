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
    // Prevent redirect loops - never redirect back to /login
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        // Relative URL: if it points to /login, redirect to homepage instead
        if (url.startsWith("/login")) {
          return baseUrl;
        }
        return `${baseUrl}${url}`;
      }
      // If url starts with baseUrl, check it's not a login loop
      if (url.startsWith(baseUrl)) {
        const urlPath = url.replace(baseUrl, "");
        if (urlPath.startsWith("/login")) {
          return baseUrl;
        }
        return url;
      }
      // Fallback: go to homepage
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
