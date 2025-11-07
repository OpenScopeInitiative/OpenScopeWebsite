const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    const { userMessage } = JSON.parse(event.body);

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant for OpenScope, a student-run science communication platform. 
                        Your name is OpenScope Assistant. You provide clear, concise, and accurate information about scientific topics
                        and about navigating the OpenScope site (articles, topics, authors). Your tone is friendly, curious, and encouraging.
                        Avoid unnecessary jargon; when technical terms are required, provide short definitions.

                        When appropriate, suggest relevant OpenScope articles, topics, or site pages that might help the user discover more.

                        Example available articles (site may contain more):
                        1. "The Nuanced Shift Towards Green Chemistry In Suzuki-Miyaura Coupling Reactions" - chemistry & environmental science

                        If asked about topics outside the site's scope, acknowledge and gently redirect to science communication or recommend external reputable sources.
                        If you don't know the answer, say so and offer suggestions for where to look (e.g., peer-reviewed journals, educational resources).

                        Keep your responses concise (under ~150 words when possible), and prioritize clarity and accessibility for high-school students.
                        `,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to process request",
        message: error.message,
      }),
    };
  }
};
