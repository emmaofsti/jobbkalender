import { NextResponse } from "next/server";

function getDateRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);
  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString()
  };
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID/SECRET");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  return res.json();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  const calendarId = request.headers.get("x-calendar-id") || request.headers.get("x-calendar") || null;

  const cookies = request.headers.get("cookie") || "";
  const refreshMatch = cookies.match(/gcal_refresh=([^;]+)/);
  const accessMatch = cookies.match(/gcal_access=([^;]+)/);
  const calendarMatch = cookies.match(/gcal_calendar=([^;]+)/);

  const refreshToken = refreshMatch ? decodeURIComponent(refreshMatch[1]) : null;
  let accessToken = accessMatch ? decodeURIComponent(accessMatch[1]) : null;
  const storedCalendar = calendarMatch ? decodeURIComponent(calendarMatch[1]) : "primary";

  if (!refreshToken && !accessToken) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  if (!accessToken && refreshToken) {
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      accessToken = refreshed.access_token;
    } catch (error) {
      return NextResponse.json({ error: "Failed to refresh access" }, { status: 401 });
    }
  }

  const { timeMin, timeMax } = getDateRange(date);
  const calendar = calendarId || storedCalendar || "primary";

  const eventsUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar)}/events`
  );
  eventsUrl.searchParams.set("timeMin", timeMin);
  eventsUrl.searchParams.set("timeMax", timeMax);
  eventsUrl.searchParams.set("singleEvents", "true");
  eventsUrl.searchParams.set("orderBy", "startTime");

  let eventsRes = await fetch(eventsUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (eventsRes.status === 401 && refreshToken) {
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      accessToken = refreshed.access_token;
      eventsRes = await fetch(eventsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } catch (error) {
      return NextResponse.json({ error: "Failed to refresh access" }, { status: 401 });
    }
  }

  if (!eventsRes.ok) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }

  const data = await eventsRes.json();
  const response = NextResponse.json({ events: data.items || [] });
  if (accessToken) {
    response.cookies.set("gcal_access", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 3600
    });
  }
  return response;
}
