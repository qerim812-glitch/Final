import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

export const Route = createFileRoute("/api/reviews")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const url = new URL(request.url);
        const venueId = sanitize(url.searchParams.get("venueId"), 64) || undefined;
        return json({ reviews: db.listReviews(venueId) });
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        const user = db.getUser(userId);
        if (!user) return json({ error: "Unknown user" }, 404);

        const body = await parseJson<{
          venueId?: string;
          rating?: number | string;
          comment?: string;
        }>(request);
        if (!body) return json({ error: "Invalid request body" }, 400);

        const venueId = sanitize(body.venueId, 64);
        const comment = sanitize(body.comment, 512);
        const rating = Math.max(1, Math.min(5, Number(body.rating) || 0));
        if (!venueId || !comment || !rating) {
          return json({ error: "Missing review fields" }, 400);
        }

        const review = db.addReview({
          venueId,
          userId,
          author: user.email,
          rating,
          comment,
        });
        db.addActivity(userId, `review:${venueId}`);
        return json({ review, reviews: db.listReviews(venueId) });
      },
    },
  },
});
