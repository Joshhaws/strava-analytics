const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET;


export async function initiateStravaAuth() {
  const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

  if (!STRAVA_CLIENT_ID || !REDIRECT_URI) {
    console.error("Missing environment variables for Strava authorization.");
    return;
  }

  const scope = 'read,activity:read_all';
  const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;

  console.log(`[StravaAuth] Redirecting to: ${url}`);
  window.location.replace(url);
}


export async function exchangeToken(code: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  return response.json();
}

export async function fetchActivities(accessToken: string, after?: number) {
  const params = new URLSearchParams({
    per_page: '100',
    ...(after && { after: after.toString() }),
  });

  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.json();
}