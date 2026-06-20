import NextAuth, { type NextAuthOptions, type Adapter, type AdapterUser, type AdapterAccount, type AdapterSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

/* ────────────────────────────────────────────────────────────── */
/*  Custom Prisma Adapter — fully compatible with next-auth v4    */
/* ────────────────────────────────────────────────────────────── */

function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(data) {
      const user = await db.user.create({
        data: {
          name: data.name,
          email: data.email!,
          emailVerified: data.emailVerified,
          image: data.image,
        },
      });
      return user as AdapterUser;
    },

    async getUser(id) {
      const user = await db.user.findUnique({ where: { id } });
      return user as AdapterUser | null;
    },

    async getUserByEmail(email) {
      if (!email) return null;
      const user = await db.user.findUnique({ where: { email } });
      return user as AdapterUser | null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return (account?.user ?? null) as AdapterUser | null;
    },

    async updateUser({ id, ...data }) {
      const user = await db.user.update({ where: { id }, data });
      return user as AdapterUser;
    },

    async deleteUser(id) {
      await db.user.delete({ where: { id } });
    },

    async linkAccount(account) {
      await db.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await db.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      const session = await db.session.create({
        data: { sessionToken, userId, expires },
      });
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const sessionWithUser = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!sessionWithUser) return null;
      const { user, ...session } = sessionWithUser;
      return { session: session as AdapterSession, user: user as AdapterUser };
    },

    async updateSession({ sessionToken, ...data }) {
      const session = await db.session.update({
        where: { sessionToken },
        data,
      });
      return session as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await db.session.delete({ where: { sessionToken } });
    },
  };
}

/* ────────────────────────────────────────────────────────────── */
/*  NextAuth Configuration                                        */
/* ────────────────────────────────────────────────────────────── */

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(),
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
  session: {
    strategy: "database",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
