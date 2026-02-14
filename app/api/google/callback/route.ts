import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const calendarId = url.searchParams.get("state") || "primary";

  if (error) {
    return NextResponse.redirect(`${url.origin}/day?google=error`);
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Missing GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI" },
      { status: 500 }
    );
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }

  const tokens = await tokenRes.json();
  const response = NextResponse.redirect(`${url.origin}/day?google=connected`);

  if (tokens.refresh_token) {
    response.cookies.set("gcal_refresh", tokens.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  response.cookies.set("gcal_access", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in || 3600
  });

  response.cookies.set("gcal_calendar", calendarId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
