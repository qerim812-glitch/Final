import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

function isAdmin(request: Request): boolean {
  const userId = sessionUserId(request);
  const user = userId ? db.getUser(userId) : undefined;
  return !!user && user.email === "admin@socialcircle.al";
}

export const Route = createFileRoute("/api/reports")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      // Admin-only read: the admin page requests this once it authenticates.
      GET: async ({ request }) => {
        if (!isAdmin(request)) return json({ error: "Admin required" }, 403);
        return json({ reports: db.listReports() });
      },

      // Admin-only: delete a report by id in the query string.
      DELETE: async ({ request }) => {
        if (!isAdmin(request)) return json({ error: "Admin required" }, 403);
        const url = new URL(request.url);
        const reportId = sanitize(url.searchParams.get("id"), 64);
        if (!reportId) return json({ error: "Missing id" }, 400);
        const removed = db.deleteReport(reportId);
        return removed ? json({ ok: true, reports: db.listReports() }) : json({ error: "Not found" }, 404);
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        const user = db.getUser(userId);
        if (!user) return json({ error: "Unknown user" }, 404);

        const body = await parseJson<{
          reportedUser?: string;
          reason?: string;
          description?: string;
        }>(request);
        if (!body) return json({ error: "Invalid request body" }, 400);

        const reportedUser = sanitize(body.reportedUser, 128);
        const reason = sanitize(body.reason, 128);
        const description = sanitize(body.description, 1024);
        if (!reportedUser || !reason || !description) {
          return json({ error: "Missing report fields" }, 400);
        }

        const report = db.addReport({
          reporterUserId: userId,
          reporterEmail: user.email,
          reportedUser,
          reason,
          description,
        });
        db.addActivity(userId, `report:${reportedUser}`);
        return json({ report });
      },
    },
  },
});
