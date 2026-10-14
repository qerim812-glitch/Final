import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

export const Route = createFileRoute("/api/dms")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ messages: [] });
        const url = new URL(request.url);
        const peer = sanitize(url.searchParams.get("peer"), 64);
        if (!peer) return json({ messages: [] });
        return json({ messages: db.listDMs(userId, peer) });
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);

        const body = await parseJson<{ to?: string; text?: string }>(request);
        const to = sanitize(body?.to, 64);
        const text = sanitize(body?.text, 500);
        if (!to || !text) return json({ error: "Missing fields" }, 400);

        const message = db.addDM({ fromUserId: userId, toUserId: to, text });
        return json({ message, messages: db.listDMs(userId, to) });
      },
    },
  },
});
