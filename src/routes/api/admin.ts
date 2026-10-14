import { createFileRoute } from "@tanstack/react-router";

import { db, isAdminEmail } from "../../lib/db";
import { json, parseJson, preflight, sanitize } from "../../lib/api-helpers";

// Dedicated admin login/data endpoint. Separate from /api/user so the public
// account form never gates on admin credentials.
export const Route = createFileRoute("/api/admin")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      // Returns bookings + reports for the admin spreadsheet. Requires a POST
      // login first (the client caches the admin's userId then calls this).
      GET: async ({ request }) => {
        const header = request.headers.get("x-user-id") ?? "";
        const user = db.getUser(header);
        if (!user || !isAdminEmail(user.email)) {
          return json({ error: "Admin required" }, 403);
        }
        const bookings = db.allBookings().map((b) => {
          const owner = db.getUser(b.userId);
          return {
            ...b,
            email: owner?.email ?? "",
            ageRange: owner?.ageRange ?? "",
          };
        });
        return json({ bookings, reports: db.listReports() });
      },

      POST: async ({ request }) => {
        const body = await parseJson<{
          email?: string;
          password?: string;
        }>(request);
        if (!body) return json({ error: "Invalid request body" }, 400);

        // Accept "admin" shorthand for the primary admin, or any admin email.
        const raw = sanitize(body.email, 128).toLowerCase();
        const email = raw === "admin" ? "admin@socialcircle.al" : raw;
        const password = sanitize(body.password, 128);

        const user = await db.authenticate(email, password);
        if (!user || !isAdminEmail(user.email)) {
          return json({ error: "Invalid admin credentials" }, 401);
        }
        return json({ user: { userId: user.userId, email: user.email } });
      },
    },
  },
});
