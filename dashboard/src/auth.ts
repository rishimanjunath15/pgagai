// ============================================
// AUTH CONFIG - NextAuth v5 (App Router)
// ============================================
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ---- Mock user database ----
const MOCK_USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@dashboard.com",
    password: "demo123",
    initials: "D",
    plan: "Free",
    bio: "Exploring the personalized dashboard.",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@dashboard.com",
    password: "admin123",
    initials: "A",
    plan: "Pro",
    bio: "Full access admin account.",
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = MOCK_USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          // Extra fields surfaced through JWT/session callbacks
          initials: user.initials,
          plan: user.plan,
          bio: user.bio,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session: sessionUpdate }: any) {
      // On first sign-in: copy custom fields from the user object into the JWT
      if (user) {
        token.initials = user.initials;
        token.plan    = user.plan;
        token.bio     = user.bio;
      }

      // When the client calls update({ name, bio, avatarId }) persist changes into JWT
      if (trigger === "update" && sessionUpdate) {
        if (sessionUpdate.name    !== undefined) token.name    = sessionUpdate.name;
        if (sessionUpdate.bio     !== undefined) token.bio     = sessionUpdate.bio;
        if (sessionUpdate.avatarId !== undefined) token.avatarId = sessionUpdate.avatarId;
        // Re-derive initials from the new name
        if (sessionUpdate.name) {
          token.initials = sessionUpdate.name.charAt(0).toUpperCase();
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Surface extra fields from the JWT into the session
      if (session.user) {
        // Double-cast through unknown to bypass strict intersection type on session.user
        const u = session.user as unknown as Record<string, unknown>;
        u.id       = token.sub;
        u.initials = token.initials;
        u.plan     = token.plan;
        u.bio      = token.bio;
        u.avatarId = token.avatarId;
        // Sync the standard name field too
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET ?? "fallback-dev-secret-change-in-prod",
});
