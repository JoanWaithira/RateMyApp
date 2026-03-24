function getEnv(name) {
  return (process.env[name] || "").trim();
}

function getSupabaseConfig() {
  const url = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed"
    };
  }

  const config = getSupabaseConfig();
  if (!config) {
    return {
      statusCode: 503,
      body: "Supabase is not configured"
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: "Invalid JSON body"
    };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/survey_responses?on_conflict=started_at`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: text || "Supabase insert failed"
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: text || JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message || "Unexpected server error"
    };
  }
};
