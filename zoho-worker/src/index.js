const jsonResponse = (status, data, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });

const buildCorsHeaders = (origin, allowedOrigin) => {
  const allowOrigin = origin && origin === allowedOrigin ? origin : allowedOrigin;
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
};

const parseBody = async (request) => {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Invalid content type. Use application/json.");
  }

  return request.json();
};

const validatePayload = (payload) => {
  const required = ["fullName", "email", "projectType", "location", "budget", "brief", "timeline", "channel"];
  const missing = required.filter((field) => !payload[field] || String(payload[field]).trim() === "");

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

const getAccessToken = async (env) => {
  const tokenUrl = `${env.ZOHO_ACCOUNTS_BASE}/oauth/v2/token`;
  const body = new URLSearchParams({
    refresh_token: env.ZOHO_REFRESH_TOKEN,
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const tokenResp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokenData = await tokenResp.json();
  if (!tokenResp.ok || !tokenData.access_token) {
    throw new Error("Zoho token refresh failed.");
  }

  return tokenData.access_token;
};

const toZohoRecord = (payload) => ({
  Last_Name: payload.fullName,
  Email: payload.email,
  Company: payload.location,
  Lead_Source: "Website",
  Description: [
    `Project Type: ${payload.projectType}`,
    `Budget: ${payload.budget}`,
    `Timeline: ${payload.timeline}`,
    `Preferred Channel: ${payload.channel}`,
    "",
    "Project Brief:",
    payload.brief,
  ].join("\n"),
});

const createZohoLead = async (accessToken, env, payload) => {
  const url = `${env.ZOHO_API_BASE}/crm/v2/${env.ZOHO_MODULE}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Zoho-oauthtoken ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      data: [toZohoRecord(payload)],
      trigger: ["workflow"],
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error("Zoho lead creation failed.");
  }

  return data;
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse(405, { ok: false, error: "Method not allowed" }, corsHeaders);
    }

    try {
      const payload = await parseBody(request);
      validatePayload(payload);

      const accessToken = await getAccessToken(env);
      await createZohoLead(accessToken, env, payload);

      return jsonResponse(200, { ok: true, message: "Request sent successfully." }, corsHeaders);
    } catch (error) {
      return jsonResponse(
        400,
        { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
        corsHeaders
      );
    }
  },
};
