export default {
  async scheduled(event, env, ctx) {
    try {
      const WEBHOOK_URL = env.CIRCLECI_WEBHOOK_URL;
      const CIRCLECI_TOKEN = env.CIRCLECI_TOKEN; // Optional token, may not be required for webhook

      if (!WEBHOOK_URL) {
        console.error("CIRCLECI_WEBHOOK_URL is not set in environment variables");
        return;
      }

      // Log the URL for debugging (redact sensitive parts if needed)
      console.log(`[Scheduled] Using WEBHOOK_URL: ${WEBHOOK_URL}`);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CIRCLECI_TOKEN && { "Circle-Token": CIRCLECI_TOKEN }) // Include token only if set
        },
        body: JSON.stringify({}) // Empty body as per webhook example
      });

      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Scheduled request executed`);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      } else {
        const result = await response.text();
        console.log("Response body:", result);
      }
    } catch (error) {
      console.error("Scheduled request failed:", error.message);
    }
  },

  async fetch(request, env, ctx) {
    // Test endpoint for manual triggering
    if (request.url.includes('/test')) {
      try {
        const WEBHOOK_URL = env.CIRCLECI_WEBHOOK_URL;
        const CIRCLECI_TOKEN = env.CIRCLECI_TOKEN; // Optional token

        if (!WEBHOOK_URL) {
          return new Response("CIRCLECI_WEBHOOK_URL is not set in environment variables", {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          });
        }

        console.log(`[Test] Using WEBHOOK_URL: ${WEBHOOK_URL}`);

        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(CIRCLECI_TOKEN && { "Circle-Token": CIRCLECI_TOKEN }) // Include token only if set
          },
          body: JSON.stringify({})
        });

        const responseText = await response.text();
        return new Response(`Test request completed. Status: ${response.status}\nResponse: ${responseText}`, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error) {
        return new Response(`Test failed: ${error.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    // Default response for other requests
    return new Response('CircleCI Scheduler Worker is running', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
