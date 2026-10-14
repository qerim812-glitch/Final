import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

export const Route = createFileRoute("/api/favorites")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ favorites: [] });
        return json({ favorites: db.listFavorites(userId) });
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);

        const body = await parseJson<{ venueId?: string }>(request);
        const venueId = sanitize(body?.venueId, 64);
        if (!venueId) return json({ error: "Missing venueId" }, 400);

        const favorites = db.toggleFavorite(userId, venueId);
        return json({ favorites });
      },
    },
  },
});
