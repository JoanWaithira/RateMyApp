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
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
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

  try {
    const response = await fetch(
      `${config.url}/rest/v1/survey_responses?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: config.serviceRoleKey,
          Authorization: `Bearer ${config.serviceRoleKey}`
        }
      }
    );

    const text = await response.text();
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: text || "Supabase fetch failed"
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ responses: JSON.parse(text || "[]") })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message || "Unexpected server error"
    };
  }
};
