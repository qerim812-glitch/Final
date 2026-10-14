import { createFileRoute } from "@tanstack/react-router";

import { db, publicUser } from "../../lib/db";
import {
  isValidEmail,
  json,
  parseJson,
  preflight,
  sanitize,
  sessionUserId,
} from "../../lib/api-helpers";

const VALID_AGES = new Set(["18-24", "25-30", "31-36", "37+"]);

export const Route = createFileRoute("/api/user")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      // Return the authenticated user, with bookings so the account page can
      // render without a second round-trip.
      GET: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ user: null, bookings: [], favorites: [] });
        const user = db.getUser(userId);
        if (!user) return json({ user: null, bookings: [], favorites: [] });
        return json({
          user: publicUser(user),
          bookings: db.listBookings(user.userId),
          favorites: db.listFavorites(user.userId),
        });
      },

      // Register or log in. The same endpoint handles both so the welcome modal
      // can send one request regardless of whether the email is new.
      POST: async ({ request }) => {
        const body = await parseJson<{
          email?: string;
          password?: string;
          ageRange?: string;
          action?: string;
        }>(request);
        if (!body) return json({ error: "Invalid request body" }, 400);

        const email = sanitize(body.email);
        const password = sanitize(body.password, 128);
        const ageRange = sanitize(body.ageRange, 16);

        if (!isValidEmail(email)) return json({ error: "Invalid email format" }, 400);
        if (password.length < 6) return json({ error: "Password too short" }, 400);

        if (body.action === "login") {
          const existing = await db.authenticate(email, password);
          if (!existing) return json({ error: "Invalid email or password" }, 401);
          return json({ user: publicUser(existing) });
        }

        const safeAge = VALID_AGES.has(ageRange) ? ageRange : "";
        const user = await db.createUser(email, password, safeAge);
        db.addActivity(user.userId, "registered");
        return json({ user: publicUser(user) });
      },

      // Profile edits — email, age, password. Scoped to the session user.
      // Sending {"action":"logout"} clears server-side activity but the client
      // is responsible for forgetting its own session id.
      DELETE: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        db.deleteUser(userId);
        return json({ ok: true });
      },
    },
  },
});
