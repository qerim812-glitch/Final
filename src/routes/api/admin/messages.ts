import { createFileRoute } from "@tanstack/react-router";

import { db, isAdminEmail } from "../../../lib/db";
import { json, parseJson, preflight, sanitize } from "../../../lib/api-helpers";

function requireAdmin(request: Request): boolean {
  const userId = request.headers.get("x-user-id") ?? "";
  const user = db.getUser(userId);
  return isAdminEmail(user?.email);
}

export const Route = createFileRoute("/api/admin/messages")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      // Return every community chat message and every DM so the admin page
      // can show them side-by-side.
      GET: async ({ request }) => {
        if (!requireAdmin(request)) return json({ error: "Admin required" }, 403);
        return json({
          chat: db.listChat(500),
          dms: db.listAllDMs(),
        });
      },

      // POST { kind: "chat"|"dm", id } — deletes one message. POST not DELETE
      // so the body is simple to send from the admin page.
      POST: async ({ request }) => {
        if (!requireAdmin(request)) return json({ error: "Admin required" }, 403);
        const body = await parseJson<{ kind?: string; id?: string }>(request);
        const kind = sanitize(body?.kind, 16);
        const messageId = sanitize(body?.id, 128);
        if (!messageId) return json({ error: "Missing id" }, 400);

        let removed = false;
        if (kind === "chat") removed = db.deleteChatMessage(messageId);
        else if (kind === "dm") removed = db.deleteDM(messageId);
        else return json({ error: "Unknown kind" }, 400);

        if (!removed) return json({ error: "Not found" }, 404);
        return json({ ok: true, chat: db.listChat(500), dms: db.listAllDMs() });
      },
    },
  },
});
