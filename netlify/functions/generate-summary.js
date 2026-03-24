exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed"
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: "Missing OPENAI_API_KEY environment variable"
    };
  }

  let input;
  try {
    input = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: "Invalid JSON body"
    };
  }

  const prompt = [
    "You are summarising feedback about the Gate Sofia Digital Twin application.",
    "",
    `User role: ${input.role || "Unknown"}`,
    "",
    "Task completion:",
    JSON.stringify(input.tasks || {}, null, 2),
    "",
    "Feature ratings (1-5):",
    JSON.stringify(input.ratings || {}, null, 2),
    "",
    `Overall rating: ${input.overall || 0}/5`,
    "",
    `What worked well: ${input.whatWorked || ""}`,
    `What needs improvement: ${input.whatNeeded || ""}`,
    `Would use it: ${input.wouldUse || ""}`,
    "",
    "Write a short personalised feedback summary in 3-4 sentences.",
    "Address what this user valued most, the main pain point, and one specific recommendation.",
    "Write directly to the development team, not to the user.",
    "Be specific, actionable, plain English, and do not use bullet points."
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 220
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: data.error?.message || "OpenAI request failed"
      };
    }

    const summary =
      data.output_text ||
      data.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text ||
      "";

    if (!summary) {
      return {
        statusCode: 502,
        body: "OpenAI returned no summary text"
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ summary })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message || "Unexpected server error"
    };
  }
};
