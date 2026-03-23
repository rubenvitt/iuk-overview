import { NextResponse } from "next/server";

export async function GET() {
  const issuer = process.env.POCKET_ID_ISSUER;
  const appUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

  if (!issuer) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  try {
    const discovery = await fetch(
      `${issuer}/.well-known/openid-configuration`,
    ).then((r) => r.json());

    const endSessionUrl = new URL(discovery.end_session_endpoint);
    endSessionUrl.searchParams.set(
      "post_logout_redirect_uri",
      `${appUrl}/login`,
    );

    return NextResponse.redirect(endSessionUrl.toString());
  } catch {
    return NextResponse.redirect(new URL("/login", appUrl));
  }
}
