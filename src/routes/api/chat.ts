import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { json, parseJson, preflight, sanitize, sessionUserId } from "../../lib/api-helpers";

const CHAT_LIMIT_PER_USER = 10;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const userId = sessionUserId(request);
        return json({
          messages: db.listChat(),
          sentByMe: userId ? db.countChatForUser(userId) : 0,
          limit: CHAT_LIMIT_PER_USER,
        });
      },

      POST: async ({ request }) => {
        const userId = sessionUserId(request);
        if (!userId) return json({ error: "Not authenticated" }, 401);
        const user = db.getUser(userId);
        if (!user) return json({ error: "Unknown user" }, 404);

        if (db.countChatForUser(userId) >= CHAT_LIMIT_PER_USER) {
          return json({ error: "Message limit reached", limit: CHAT_LIMIT_PER_USER }, 429);
        }

        const body = await parseJson<{ text?: string }>(request);
        const text = sanitize(body?.text, 500);
        if (!text) return json({ error: "Empty message" }, 400);

        const message = db.addChat({ userId, author: user.userId, text });
        return json({
          message,
          messages: db.listChat(),
          sentByMe: db.countChatForUser(userId),
          limit: CHAT_LIMIT_PER_USER,
        });
      },
    },
  },
});
