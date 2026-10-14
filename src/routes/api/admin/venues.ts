import { createFileRoute } from "@tanstack/react-router";

import { db, isAdminEmail } from "../../../lib/db";
import { json, parseJson, preflight, sanitize } from "../../../lib/api-helpers";

function requireAdmin(request: Request): boolean {
  const userId = request.headers.get("x-user-id") ?? "";
  const user = db.getUser(userId);
  return isAdminEmail(user?.email);
}

type VenueBody = {
  id?: string;
  name?: string;
  image?: string;
  description?: string;
  locationUrl?: string;
  minAge?: number | string;
  maxAge?: number | string;
  activeCount?: number | string;
  totalBookings?: number | string;
  hasLocationsDropdown?: boolean | string;
  op?: string;
};

function toInt(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export const Route = createFileRoute("/api/admin/venues")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        if (!requireAdmin(request)) return json({ error: "Admin required" }, 403);
        return json({ venues: db.listVenues() });
      },

      // POST { op: "create"|"update"|"delete", ...venue }
      POST: async ({ request }) => {
        if (!requireAdmin(request)) return json({ error: "Admin required" }, 403);
        const body = await parseJson<VenueBody>(request);
        if (!body) return json({ error: "Invalid body" }, 400);

        const op = sanitize(body.op, 16) || "create";
        const venueId = sanitize(body.id, 64);

        if (op === "delete") {
          if (!venueId) return json({ error: "Missing id" }, 400);
          const removed = db.deleteVenue(venueId);
          return removed ? json({ ok: true, venues: db.listVenues() }) : json({ error: "Not found" }, 404);
        }

        const name = sanitize(body.name, 128);
        const image = sanitize(body.image, 1024);
        const description = sanitize(body.description, 1024);
        const locationUrl = sanitize(body.locationUrl, 1024);
        const minAge = toInt(body.minAge, 18);
        const maxAge = toInt(body.maxAge, 99);
        const activeCount = toInt(body.activeCount, 0);
        const totalBookings = toInt(body.totalBookings, 0);
        const hasLocationsDropdown =
          body.hasLocationsDropdown === true || body.hasLocationsDropdown === "true";

        if (op === "update") {
          if (!venueId) return json({ error: "Missing id" }, 400);
          const venue = db.updateVenue(venueId, {
            name,
            image,
            description,
            locationUrl,
            minAge,
            maxAge,
            activeCount,
            totalBookings,
            hasLocationsDropdown,
          });
          if (!venue) return json({ error: "Not found" }, 404);
          return json({ ok: true, venue, venues: db.listVenues() });
        }

        if (!name) return json({ error: "Venue name required" }, 400);
        const base = {
          name,
          image,
          description,
          locationUrl,
          minAge,
          maxAge,
          activeCount,
          totalBookings,
          hasLocationsDropdown,
        };
        const venue = venueId ? db.addVenue({ ...base, id: venueId }) : db.addVenue(base);
        return json({ ok: true, venue, venues: db.listVenues() });
      },
    },
  },
});
