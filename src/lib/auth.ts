import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

const ADMIN_GROUP = process.env.ADMIN_GROUP ?? "dashboard-admins";
const GROUPS_CLAIM = process.env.POCKET_ID_GROUPS_CLAIM ?? "groups";
const SCOPES = process.env.POCKET_ID_SCOPES ?? "openid profile email groups";

async function getOIDCConfig() {
  const issuer = process.env.POCKET_ID_ISSUER!;
  const res = await fetch(`${issuer}/.well-known/openid-configuration`);
  return res.json() as Promise<{ token_endpoint: string; end_session_endpoint: string }>;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshTokenError" };
  }

  try {
    const { token_endpoint } = await getOIDCConfig();

    const res = await fetch(token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
        client_id: process.env.POCKET_ID_CLIENT_ID!,
        client_secret: process.env.POCKET_ID_CLIENT_SECRET!,
      }),
    });

    if (!res.ok) throw new Error("Token refresh failed");

    const refreshed = await res.json();
    return {
      ...token,
      accessToken: refreshed.access_token,
      idToken: refreshed.id_token ?? token.idToken,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt:
        refreshed.expires_at ??
        Math.floor(Date.now() / 1000 + refreshed.expires_in),
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}

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
    async jwt({ token, profile, user, account }) {
      // On initial sign-in, store OAuth tokens
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Extract groups from the OIDC profile
      if (profile) {
        const groups = (profile as Record<string, unknown>)[GROUPS_CLAIM];
        token.groups = Array.isArray(groups) ? groups : [];
      }
      if (user?.groups) {
        token.groups = user.groups;
      }

      // Refresh expired access token
      if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number)) {
        return refreshAccessToken(token);
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
      if (token.error) {
        session.error = token.error as string;
      }
      return session;
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
  trustHost: true,
});
