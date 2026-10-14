import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

export const Route = createFileRoute("/api/bookings")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ bookings: [] });
        return json({ bookings: db.listBookings(userId) });
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);

        const body = await parseJson<{
          venueId?: string;
          place?: string;
          date?: string;
          time?: string;
        }>(request);
        if (!body) return json({ error: "Invalid request body" }, 400);

        const venueId = sanitize(body.venueId, 64);
        const place = sanitize(body.place, 128);
        const date = sanitize(body.date, 32);
        const time = sanitize(body.time, 16);
        if (!venueId || !place || !date || !time) {
          return json({ error: "Missing booking fields" }, 400);
        }

        const booking = db.addBooking({ userId, venueId, place, date, time });
        db.addActivity(userId, `booked:${place}`);
        return json({ booking, bookings: db.listBookings(userId) });
      },
    },
  },
});
