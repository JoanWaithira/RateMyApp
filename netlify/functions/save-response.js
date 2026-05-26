function getEnv(name) {
  return (process.env[name] || "").trim();
}

function getSupabaseConfig(prefix = "") {
  const suffix = prefix ? `_${prefix}` : "";
  const url = getEnv(`SUPABASE_URL${suffix}`);
  const serviceRoleKey = getEnv(`SUPABASE_SERVICE_ROLE_KEY${suffix}`);
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

async function saveToSupabase(config, payload) {
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
  return { ok: response.ok, status: response.status, body: text };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed"
    };
  }

  const primaryConfig = getSupabaseConfig();
  if (!primaryConfig) {
    return {
      statusCode: 503,
      body: "Supabase is not configured"
    };
  }

  const hasSecondaryUrl = !!getEnv("SUPABASE_URL_SECONDARY");
  const hasSecondaryKey = !!getEnv("SUPABASE_SERVICE_ROLE_KEY_SECONDARY");
  if (hasSecondaryUrl !== hasSecondaryKey) {
    return {
      statusCode: 503,
      body: "Secondary Supabase is partially configured"
    };
  }

  const secondaryConfig = getSupabaseConfig("SECONDARY");

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
    const primaryResult = await saveToSupabase(primaryConfig, payload);
    if (!primaryResult.ok) {
      return {
        statusCode: primaryResult.status,
        body: primaryResult.body || "Primary Supabase insert failed"
      };
    }

    if (secondaryConfig) {
      const secondaryResult = await saveToSupabase(secondaryConfig, payload);
      if (!secondaryResult.ok) {
        return {
          statusCode: 502,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ok: false,
            primarySaved: true,
            secondarySaved: false,
            message: "Saved to primary database, but secondary database write failed",
            secondaryStatus: secondaryResult.status,
            secondaryError: secondaryResult.body || "Secondary Supabase insert failed"
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: true,
        primarySaved: true,
        secondarySaved: !!secondaryConfig
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message || "Unexpected server error"
    };
  }
};
