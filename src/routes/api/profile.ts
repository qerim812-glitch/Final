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

export const Route = createFileRoute("/api/profile")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      // Update the signed-in user's email / password / age range from the
      // account page's profile form.
      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        const user = db.getUser(userId);
        if (!user) return json({ error: "Unknown user" }, 404);

        const body = await parseJson<{
          email?: string;
          password?: string;
          ageRange?: string;
        }>(request);
        if (!body) return json({ error: "Invalid request body" }, 400);

        if (body.email !== undefined) {
          const email = sanitize(body.email);
          if (!isValidEmail(email)) return json({ error: "Invalid email format" }, 400);
          db.updateUser(userId, { email });
        }
        if (body.ageRange !== undefined) {
          db.updateUser(userId, { ageRange: sanitize(body.ageRange, 16) });
        }
        if (body.password !== undefined) {
          const password = sanitize(body.password, 128);
          if (password.length < 6) return json({ error: "Password too short" }, 400);
          await db.updateUserPassword(userId, password);
        }

        db.addActivity(userId, "profile_updated");
        const refreshed = db.getUser(userId)!;
        return json({ user: publicUser(refreshed) });
      },
    },
  },
});
