import { createFileRoute } from "@tanstack/react-router";

import { db, isAdminEmail } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

function isAdmin(request: Request): boolean {
  const userId = request.headers.get("x-user-id") ?? "";
  const user = db.getUser(userId);
  return isAdminEmail(user?.email);
}

export const Route = createFileRoute("/api/donations")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      // Admin only — view all donations.
      GET: async ({ request }) => {
        if (!isAdmin(request)) return json({ error: "Admin required" }, 403);
        return json({ donations: db.listDonations() });
      },

      // Any signed-in user — record a donation attempt. Donations are stored
      // for the admin dashboard; this endpoint doesn't actually move money.
      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        const user = db.getUser(userId);
        if (!user) return json({ error: "Unknown user" }, 404);

        const body = await parseJson<{ amount?: number | string; method?: string }>(request);
        if (!body) return json({ error: "Invalid body" }, 400);

        const amount = Number(body.amount);
        const method = sanitize(body.method, 32);
        if (!(amount > 0)) return json({ error: "Amount must be > 0" }, 400);
        if (!method) return json({ error: "Payment method required" }, 400);

        const donation = db.addDonation({
          userId,
          email: user.email,
          amount,
          method,
        });
        db.addActivity(userId, `donation:${method}:${amount}`);
        return json({ donation });
      },

      // Admin — delete a donation record.
      DELETE: async ({ request }) => {
        if (!isAdmin(request)) return json({ error: "Admin required" }, 403);
        const url = new URL(request.url);
        const donationId = sanitize(url.searchParams.get("id"), 64);
        if (!donationId) return json({ error: "Missing id" }, 400);
        const removed = db.deleteDonation(donationId);
        return removed ? json({ ok: true, donations: db.listDonations() }) : json({ error: "Not found" }, 404);
      },
    },
  },
});
