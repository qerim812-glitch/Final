import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

export const Route = createFileRoute("/api/activity")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ activity: [] });
        return json({ activity: db.listActivity(userId) });
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        const body = await parseJson<{ action?: string }>(request);
        const action = sanitize(body?.action, 128);
        if (!action) return json({ error: "Missing action" }, 400);
        const entry = db.addActivity(userId, action);
        return json({ entry });
      },
    },
  },
});
