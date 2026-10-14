// Unified in-memory data store for all app features.
//
// The serverless runtime has no writable filesystem, so this lives in the warm
// instance and is lost on cold starts. Everything the app persists goes through
// this module — swap the backing Maps for a real database (D1, Postgres,
// Supabase) in one place when you provision one.

export type User = {
  userId: string;
  email: string;
  passwordHash: string;
  ageRange: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  userId: string;
  venueId: string;
  place: string;
  date: string;
  time: string;
  createdAt: string;
};

export type Review = {
  id: string;
  venueId: string;
  userId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  userId: string;
  author: string;
  text: string;
  createdAt: string;
};

export type DirectMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: string;
};

export type Report = {
  id: string;
  reporterUserId: string;
  reporterEmail: string;
  reportedUser: string;
  reason: string;
  description: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  userId: string;
  action: string;
  createdAt: string;
};

type Store = {
  users: Map<string, User>;
  bookings: Map<string, Booking>;
  favorites: Map<string, Set<string>>;
  reviews: Map<string, Review>;
  chat: ChatMessage[];
  dms: DirectMessage[];
  reports: Map<string, Report>;
  activity: Activity[];
  nextUserSeq: number;
};

// Globals survive HMR in dev; without `globalThis` every edit resets the store.
declare global {
  // eslint-disable-next-line no-var
  var __socialCircleStore: Store | undefined;
}

function createStore(): Store {
  return {
    users: new Map(),
    bookings: new Map(),
    favorites: new Map(),
    reviews: new Map(),
    chat: [],
    dms: [],
    reports: new Map(),
    activity: [],
    nextUserSeq: 1003,
  };
}

const store: Store = globalThis.__socialCircleStore ?? createStore();
if (!globalThis.__socialCircleStore) {
  globalThis.__socialCircleStore = store;
  // Seed the built-in admin account. The admin page accepts `admin` (shorthand)
  // or `admin@socialcircle.al` as the email, and `Admin2016` as the password.
  void seedAdmin();
}

async function seedAdmin(): Promise<void> {
  const existing = Array.from(store.users.values()).find(
    (u) => u.email === "admin@socialcircle.al",
  );
  if (existing) return;
  const admin: User = {
    userId: "USR-ADMIN",
    email: "admin@socialcircle.al",
    passwordHash: await hashPassword("Admin2016"),
    ageRange: "25-30",
    createdAt: new Date().toISOString(),
  };
  store.users.set(admin.userId, admin);
}

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Deterministic, non-reversible digest. Not real password hashing — a prototype
// placeholder. Swap for bcrypt/argon2 when you add a real backend.
async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`sc:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const db = {
  async createUser(email: string, password: string, ageRange: string): Promise<User> {
    const existing = Array.from(store.users.values()).find((u) => u.email === email);
    if (existing) {
      existing.passwordHash = await hashPassword(password);
      existing.ageRange = ageRange || existing.ageRange;
      return existing;
    }
    const user: User = {
      userId: `USR-${store.nextUserSeq++}`,
      email,
      passwordHash: await hashPassword(password),
      ageRange,
      createdAt: new Date().toISOString(),
    };
    store.users.set(user.userId, user);
    return user;
  },

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = Array.from(store.users.values()).find((u) => u.email === email);
    if (!user) return null;
    return user.passwordHash === (await hashPassword(password)) ? user : null;
  },

  getUser(userId: string): User | undefined {
    return store.users.get(userId);
  },

  updateUser(userId: string, patch: Partial<Pick<User, "email" | "ageRange">>): User | undefined {
    const user = store.users.get(userId);
    if (!user) return undefined;
    if (patch.email !== undefined) user.email = patch.email;
    if (patch.ageRange !== undefined) user.ageRange = patch.ageRange;
    return user;
  },

  async updateUserPassword(userId: string, password: string): Promise<User | undefined> {
    const user = store.users.get(userId);
    if (!user) return undefined;
    user.passwordHash = await hashPassword(password);
    return user;
  },

  deleteUser(userId: string): void {
    store.users.delete(userId);
    store.favorites.delete(userId);
    for (const [k, b] of store.bookings) if (b.userId === userId) store.bookings.delete(k);
    for (const [k, r] of store.reviews) if (r.userId === userId) store.reviews.delete(k);
    for (const [k, r] of store.reports) if (r.reporterUserId === userId) store.reports.delete(k);
    store.chat = store.chat.filter((m) => m.userId !== userId);
    store.dms = store.dms.filter((m) => m.fromUserId !== userId && m.toUserId !== userId);
    store.activity = store.activity.filter((a) => a.userId !== userId);
  },

  listBookings(userId: string): Booking[] {
    return Array.from(store.bookings.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  addBooking(input: Omit<Booking, "id" | "createdAt">): Booking {
    const booking: Booking = { ...input, id: id("BK"), createdAt: new Date().toISOString() };
    store.bookings.set(booking.id, booking);
    return booking;
  },

  allBookings(): Booking[] {
    return Array.from(store.bookings.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  listFavorites(userId: string): string[] {
    return Array.from(store.favorites.get(userId) ?? []);
  },

  toggleFavorite(userId: string, venueId: string): string[] {
    let set = store.favorites.get(userId);
    if (!set) {
      set = new Set();
      store.favorites.set(userId, set);
    }
    if (set.has(venueId)) set.delete(venueId);
    else set.add(venueId);
    return Array.from(set);
  },

  listReviews(venueId?: string): Review[] {
    const all = Array.from(store.reviews.values());
    return (venueId ? all.filter((r) => r.venueId === venueId) : all).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  addReview(input: Omit<Review, "id" | "createdAt">): Review {
    const review: Review = { ...input, id: id("RV"), createdAt: new Date().toISOString() };
    store.reviews.set(review.id, review);
    return review;
  },

  listChat(limit = 100): ChatMessage[] {
    return store.chat.slice(-limit);
  },

  addChat(input: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
    const msg: ChatMessage = { ...input, id: id("CM"), createdAt: new Date().toISOString() };
    store.chat.push(msg);
    if (store.chat.length > 500) store.chat.splice(0, store.chat.length - 500);
    return msg;
  },

  countChatForUser(userId: string): number {
    return store.chat.filter((m) => m.userId === userId).length;
  },

  listDMs(userIdA: string, userIdB: string): DirectMessage[] {
    return store.dms
      .filter(
        (m) =>
          (m.fromUserId === userIdA && m.toUserId === userIdB) ||
          (m.fromUserId === userIdB && m.toUserId === userIdA),
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  addDM(input: Omit<DirectMessage, "id" | "createdAt">): DirectMessage {
    const msg: DirectMessage = { ...input, id: id("DM"), createdAt: new Date().toISOString() };
    store.dms.push(msg);
    if (store.dms.length > 1000) store.dms.splice(0, store.dms.length - 1000);
    return msg;
  },

  listReports(): Report[] {
    return Array.from(store.reports.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  addReport(input: Omit<Report, "id" | "createdAt">): Report {
    const report: Report = { ...input, id: id("REP"), createdAt: new Date().toISOString() };
    store.reports.set(report.id, report);
    return report;
  },

  listActivity(userId: string, limit = 50): Activity[] {
    return store.activity.filter((a) => a.userId === userId).slice(-limit);
  },

  addActivity(userId: string, action: string): Activity {
    const entry: Activity = {
      id: id("AC"),
      userId,
      action,
      createdAt: new Date().toISOString(),
    };
    store.activity.push(entry);
    if (store.activity.length > 2000) store.activity.splice(0, store.activity.length - 2000);
    return entry;
  },
};

export function publicUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}
