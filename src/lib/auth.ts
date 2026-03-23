import NextAuth from "next-auth";

const ADMIN_GROUP = process.env.ADMIN_GROUP ?? "dashboard-admins";
const GROUPS_CLAIM = process.env.POCKET_ID_GROUPS_CLAIM ?? "groups";
const SCOPES = process.env.POCKET_ID_SCOPES ?? "openid profile email groups";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "pocket-id",
      name: "Pocket ID",
      type: "oidc",
      issuer: process.env.POCKET_ID_ISSUER,
      clientId: process.env.POCKET_ID_CLIENT_ID,
      clientSecret: process.env.POCKET_ID_CLIENT_SECRET,
      authorization: {
        params: {
          scope: SCOPES,
        },
      },
      // Handle profile from both id_token and userinfo
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          groups: (profile as Record<string, unknown>)[GROUPS_CLAIM] as string[] ?? [],
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, profile, user }) {
      // On initial sign-in, extract groups from the OIDC profile
      if (profile) {
        const groups = (profile as Record<string, unknown>)[GROUPS_CLAIM];
        token.groups = Array.isArray(groups) ? groups : [];
      }
      // Also check if groups came through the user object (from profile callback)
      if (user?.groups) {
        token.groups = user.groups;
      }
      return token;
    },
    session({ session, token }) {
      const groups = (token.groups as string[]) ?? [];
      session.user.groups = groups;
      session.user.isAdmin = groups.includes(ADMIN_GROUP);
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    authorized({ auth: session }) {
      // Proxy-level: only check authentication
      // Admin authorization is handled in the admin layout
      return !!session?.user;
    },
  },
  trustHost: true,
});
