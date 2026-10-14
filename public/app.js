const destinations = [
  {
    id: 'mulliri',
    name: 'Mulliri',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    description: 'Popular coffee hub in Tirana, perfect for remote working, fresh pastries, and social meetups.',
    locationUrl: 'https://maps.google.com/?q=Mulliri+Tirane+Albania',
    minAge: 16,
    maxAge: 60,
    activeCount: 22,
    totalBookings: 310,
    liveAgeBreakdown: { '16-24': 10, '25-35': 8, '36+': 4 },
    hasLocationsDropdown: true,
  },
  {
    id: 'moncherie',
    name: 'Moncherie',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
    description: 'Cozy, vibrant espresso bar franchise loved by students and young professionals across Tirana.',
    locationUrl: 'https://maps.google.com/?q=MonCherie+Tirane+Albania',
    minAge: 18,
    maxAge: 35,
    activeCount: 18,
    totalBookings: 245,
    liveAgeBreakdown: { '18-22': 9, '23-28': 6, '29-35': 3 },
    hasLocationsDropdown: true,
  },
  {
    id: 'sophie',
    name: 'Sophie',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    description: 'Charming lounge bar and caffe offer sweet treats and vibrant social atmospheres.',
    locationUrl: 'https://maps.google.com/?q=Sophie+Caffe+Tirane+Albania',
    minAge: 18,
    maxAge: 45,
    activeCount: 15,
    totalBookings: 189,
    liveAgeBreakdown: { '18-25': 7, '26-35': 5, '36-45': 3 },
    hasLocationsDropdown: true,
  },
  {
    id: 'le-cheateau',
    name: 'Le Chateau',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    description: 'Elegant lounge environment featuring fine drinks, signature cocktails, and relaxed vibes.',
    locationUrl: 'https://maps.google.com/?q=Le+Chateau+Tirane+Albania',
    minAge: 21,
    maxAge: 65,
    activeCount: 27,
    totalBookings: 412,
    liveAgeBreakdown: { '21-30': 12, '31-45': 10, '46+': 5 },
    hasLocationsDropdown: false,
  },
  {
    id: 'millenium-garden',
    name: 'Millenium Garden',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/3f/36/d5/caption.jpg?w=900&h=-1&s=1',
    description: 'Spacious outdoor terrace garden bar along Pedonalja, ideal for large gatherings.',
    locationUrl: 'https://maps.google.com/?q=Millennium+Garden+Tirane+Albania',
    minAge: 18,
    maxAge: 70,
    activeCount: 34,
    totalBookings: 520,
    liveAgeBreakdown: { '18-25': 14, '26-40': 12, '41+': 8 },
    hasLocationsDropdown: false,
  },
  {
    id: 'my-way',
    name: 'My Way - Liqeni Artificial Tirane',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    description: 'Scenic bar right by Tirana Artificial Lake, offering panoramic water views and great cocktails.',
    locationUrl: 'https://maps.google.com/?q=My+Way+Liqeni+Artificial+Tirane+Albania',
    minAge: 20,
    maxAge: 50,
    activeCount: 31,
    totalBookings: 380,
    liveAgeBreakdown: { '20-29': 15, '30-40': 11, '41-50': 5 },
    hasLocationsDropdown: false,
  },
  {
    id: 'komiteti',
    name: 'Komiteti',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    description: 'Famous Kafe-Muzeum known for vintage Albanian culture, traditional raki, and artistic community.',
    locationUrl: 'https://maps.google.com/?q=Komiteti+Kafe+Muzeum+Tirane+Albania',
    minAge: 21,
    maxAge: 55,
    activeCount: 25,
    totalBookings: 298,
    liveAgeBreakdown: { '21-28': 11, '29-40': 9, '41-55': 5 },
    hasLocationsDropdown: false,
  },
];

const barLocationsList = [
  'bllok', 'drejtoria e policise', 'sheshi wilson', 'blv bajram curri',
  'rruga jan kukuzeli', 'rruga sami frasheri', 'rruga medar shtylla',
  'zogu i zi', 'rruga muhamet gjollesha', 'rruga e kavajes', 'toptani',
  'rruga e elbasanit', 'rruga e durresit', 'rruga e barikadave',
  'don bosco', 'ali demi', 'rruga hoxha tasim', 'kombinat',
];

// Only two things stay in localStorage: the UI theme (per-browser preference)
// and the session id (just a pointer to the DB row — not profile data).
const THEME_KEY = 'socialCircleTheme';
const SESSION_KEY = 'socialCircleSession';

// Everything else lives on the server. `currentUser` is a client-side mirror
// of what the API returned on the last fetch — never the source of truth.
const currentUser = {
  userId: '',
  email: '',
  ageRange: '',
  bookingPlace: 'None',
  bookingDate: 'N/A',
  bookingTime: 'N/A',
  bookings: [],
  favorites: [],
  createdAt: '',
};

let userChatCount = 0;
let selectedPlace = null;

function getSessionId() {
  try { return localStorage.getItem(SESSION_KEY) || ''; } catch { return ''; }
}
function setSessionId(id) {
  try { id ? localStorage.setItem(SESSION_KEY, id) : localStorage.removeItem(SESSION_KEY); } catch {}
  currentUser.userId = id;
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const session = getSessionId();
  if (session) headers['x-user-id'] = session;
  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
  return data;
}

function escapeHTML(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str ?? '').replace(/[&<>"']/g, (c) => map[c]);
}

/* Toasts */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* Dark mode */
function initDarkMode() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  if (saved === 'dark') document.body.classList.add('dark-mode');
}
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  showToast(isDark ? 'Dark mode on' : 'Light mode on');
}

/* Mobile menu */
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger-menu');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }),
  );
}

/* Favorites — server-backed */
async function toggleFavorite(venueId) {
  if (!getSessionId()) {
    showToast('Please register first to save favorites', 'error');
    return;
  }
  try {
    const { favorites } = await api('/api/favorites', { method: 'POST', body: { venueId } });
    currentUser.favorites = favorites;
    updateFavoriteButtons();
    showToast(favorites.includes(venueId) ? 'Added to favorites' : 'Removed from favorites', 'success');
  } catch (err) {
    showToast(err.message || 'Could not update favorite', 'error');
  }
}
function updateFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach((btn) => {
    const venueId = btn.dataset.venue;
    const isFav = currentUser.favorites && currentUser.favorites.includes(venueId);
    btn.classList.toggle('active', isFav);
    btn.textContent = isFav ? '★' : '☆';
  });
}

/* Search */
function filterVenues(term) {
  const q = term.toLowerCase().trim();
  return q
    ? destinations.filter((v) => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
    : destinations;
}

/* Password strength */
function calculatePasswordStrength(password) {
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^a-zA-Z0-9]/.test(password)) s++;
  return s >= 4 ? 'strong' : s >= 2 ? 'good' : 'fair';
}
const STRENGTH_PERCENT = { fair: 33, good: 66, strong: 100 };
function updateStrengthBar(barId, password) {
  const bar = document.getElementById(barId);
  if (!bar) return null;
  const s = password ? calculatePasswordStrength(password) : '';
  bar.className = s ? `strength-bar ${s}` : 'strength-bar';
  const meter = bar.closest('.strength-meter');
  if (meter) meter.setAttribute('aria-valuenow', String(STRENGTH_PERCENT[s] || 0));
  return s;
}
function showPasswordStrength(password) {
  if (!document.getElementById('password-strength-bar')) return;
  updateStrengthBar('password-strength-bar', password);
  const err = document.getElementById('registration-password-error');
  if (err) { err.textContent = ''; err.style.display = 'none'; }
}

/* Stats dashboard */
function getStats() {
  return {
    totalBookings: (currentUser.bookings || []).length,
    totalFavorites: (currentUser.favorites || []).length,
    memberSince: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Today',
    totalReviews: 0,
  };
}

/* Export user data (reads from server so it's current) */
async function exportUserData() {
  try {
    const payload = await api('/api/user');
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-circle-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported', 'success');
  } catch (err) {
    showToast(err.message || 'Could not export', 'error');
  }
}

/* Load the signed-in user (if any) + their bookings and favorites */
async function loadUserState() {
  if (!getSessionId()) return;
  try {
    const { user, bookings, favorites } = await api('/api/user');
    if (!user) { setSessionId(''); return; }
    currentUser.userId = user.userId;
    currentUser.email = user.email;
    currentUser.ageRange = user.ageRange || '';
    currentUser.createdAt = user.createdAt || '';
    currentUser.bookings = bookings || [];
    currentUser.favorites = favorites || [];
    const latest = (bookings || [])[bookings.length - 1];
    if (latest) {
      currentUser.bookingPlace = latest.place;
      currentUser.bookingDate = latest.date;
      currentUser.bookingTime = latest.time;
    }
  } catch {
    setSessionId('');
  }
}

function hasRegisteredUser() {
  return Boolean(getSessionId() && currentUser.email);
}

const ADMIN_EMAILS = new Set(['admin@socialcircle.al', 'mexhidara1@gmail.com']);
function isAdminUser() {
  return ADMIN_EMAILS.has((currentUser.email || '').toLowerCase());
}

function setupNavigationState() {
  const pathname = window.location.pathname.split('/').pop() || 'home.html';
  const pageName = pathname === 'home.html' || pathname === '' || pathname === '/' ? 'home' : pathname.replace('.html', '');
  document.querySelectorAll('.nav-links a, .side-item, .pill-nav-link').forEach((link) => {
    const target = link.dataset.page || link.dataset.side;
    if (!target) return;
    link.classList.toggle('active', target === pageName);
  });

  // Admin nav link is hidden by default; show it to the admin on every page.
  document.querySelectorAll('.pill-nav-admin').forEach((link) => {
    link.classList.toggle('hidden', !isAdminUser());
  });
}

function createCardHTML(place, showActions) {
  let selectHTML = '';
  if (place.hasLocationsDropdown) {
    selectHTML = `
      <div class="card-location-select">
        <label>Select Specific Location:</label>
        <select id="card-select-${place.id}">
          ${barLocationsList.map((loc) => `<option value="${loc}">${loc}</option>`).join('')}
        </select>
      </div>`;
  }
  const isFav = currentUser.favorites && currentUser.favorites.includes(place.id);
  const favBtn = `<button class="favorite-btn${isFav ? ' active' : ''}" data-venue="${place.id}" onclick="event.stopPropagation(); toggleFavorite('${place.id}')" aria-label="Toggle favorite">${isFav ? '★' : '☆'}</button>`;
  return `
    <div class="card">
      ${favBtn}
      <div class="card-image-wrap">
        <img src="${place.image}" alt="${escapeHTML(place.name)}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="live-counter">
          <span class="pulse"></span>
          <span id="counter-${place.id}">${place.activeCount}</span> people here now
        </div>
        <h3 class="card-title">${escapeHTML(place.name)}</h3>
        <p class="card-text">${escapeHTML(place.description)}</p>
        ${selectHTML}
        <div class="badge-age">Age: <strong>${place.minAge}–${place.maxAge}</strong></div>
        <a href="${place.locationUrl}" target="_blank" rel="noopener noreferrer" class="map-link">📍 Google Maps</a>
        <a class="btn-primary" href="detail.html?id=${place.id}">${showActions ? 'Book Here' : 'View Place'}</a>
      </div>
    </div>`;
}

function renderFilteredVenues(venues) {
  const container = document.getElementById('booking-grid');
  if (!container) return;
  container.innerHTML = venues.map((p) => createCardHTML(p, true)).join('');
  updateFavoriteButtons();
}
function renderFeaturedHome() {
  const container = document.getElementById('home-featured-grid');
  if (!container) return;
  container.innerHTML = destinations.slice(0, 3).map((p) => createCardHTML(p, false)).join('');
  updateFavoriteButtons();
}
function renderBookingList() {
  const container = document.getElementById('booking-grid');
  if (!container) return;
  container.innerHTML = destinations.map((p) => createCardHTML(p, true)).join('');
  updateFavoriteButtons();
}

function loadDetailPageFromQuery() {
  const detailHeader = document.getElementById('detail-header');
  if (!detailHeader) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'mulliri';
  selectedPlace = destinations.find((p) => p.id === id) || destinations[0];

  const bookingError = document.getElementById('booking-error');
  if (bookingError) bookingError.style.display = 'none';

  const locationContainer = document.getElementById('location-select-container');
  const locationSelect = document.getElementById('booking-location');
  if (selectedPlace.hasLocationsDropdown) {
    if (locationContainer) locationContainer.style.display = 'block';
    if (locationSelect) locationSelect.innerHTML = barLocationsList.map((l) => `<option value="${l}">${l}</option>`).join('');
  } else if (locationContainer) {
    locationContainer.style.display = 'none';
  }

  let ageBreakdownHtml = '';
  for (const [range, count] of Object.entries(selectedPlace.liveAgeBreakdown)) {
    ageBreakdownHtml += `
      <div class="stat-box">
        <div class="number" id="age-breakdown-${range}">${count}</div>
        <div class="label">Age ${range} Joined</div>
      </div>`;
  }

  detailHeader.innerHTML = `
    <h1>${escapeHTML(selectedPlace.name)}</h1>
    <p class="detail-sub">${escapeHTML(selectedPlace.description)}</p>
    <a href="${selectedPlace.locationUrl}" target="_blank" rel="noopener noreferrer" class="map-link">📍 Open in Google Maps</a>
    <h4>Live age counter for ${escapeHTML(selectedPlace.name)}</h4>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="number" id="detail-active-count">${selectedPlace.activeCount}</div>
        <div class="label">Total live guests</div>
      </div>
      ${ageBreakdownHtml}
      <div class="stat-box">
        <div class="number">${selectedPlace.minAge}–${selectedPlace.maxAge}</div>
        <div class="label">Required age</div>
      </div>
    </div>`;

  const otherPlaces = document.getElementById('detail-other-places-grid');
  if (otherPlaces) {
    otherPlaces.innerHTML = destinations
      .filter((p) => p.id !== selectedPlace.id)
      .map((p) => createCardHTML(p, true))
      .join('');
  }

  const emailInput = document.getElementById('user-email');
  if (emailInput && currentUser.email) emailInput.value = currentUser.email;
  const ageInput = document.getElementById('user-age-display');
  if (ageInput) ageInput.value = currentUser.ageRange || '';
}

function parseAgeBucket(value) {
  if (!value) return 18;
  if (value.endsWith('+')) return Number(value.replace('+', ''));
  const m = value.match(/(\d+)-(\d+)/);
  if (m) return Number(m[1]);
  return Number(value) || 18;
}

/* Registration — hits /api/user and stores just the session id */
async function handleInitialRegistration(event) {
  event.preventDefault();
  const email = document.getElementById('initial-email').value.trim();
  const password = document.getElementById('initial-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const ageRange = document.getElementById('initial-age-range').value;
  const emailError = document.getElementById('registration-email-error');
  const passwordError = document.getElementById('registration-password-error');

  let hasError = false;
  if (email.length < 6 || !email.includes('@')) {
    if (emailError) { emailError.textContent = 'Please enter a valid email (min 6 chars).'; emailError.style.display = 'block'; }
    hasError = true;
  } else if (emailError) emailError.style.display = 'none';

  if (password.length < 6) {
    if (passwordError) { passwordError.textContent = 'Password must be at least 6 characters.'; passwordError.style.display = 'block'; }
    hasError = true;
  } else if (password !== confirmPassword) {
    if (passwordError) { passwordError.textContent = 'Passwords do not match.'; passwordError.style.display = 'block'; }
    hasError = true;
  } else if (passwordError) passwordError.style.display = 'none';

  if (hasError) return;

  try {
    const { user } = await api('/api/user', { method: 'POST', body: { email, password, ageRange } });
    setSessionId(user.userId);
    await loadUserState();
    window.location.href = 'home.html';
  } catch (err) {
    showToast(err.message || 'Registration failed', 'error');
  }
}

async function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const errorEl = document.getElementById('signin-error');
  if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }

  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Email and password are required.'; errorEl.style.display = 'block'; }
    return;
  }

  // Admin may log in with just "admin" — the server resolves it.
  const normalised = email.toLowerCase() === 'admin' ? 'admin@socialcircle.al' : email;

  try {
    const { user } = await api('/api/user', {
      method: 'POST',
      body: { email: normalised, password, action: 'login' },
    });
    setSessionId(user.userId);
    await loadUserState();
    window.location.href = ADMIN_EMAILS.has((user.email || '').toLowerCase())
      ? 'admin.html'
      : 'home.html';
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'Invalid email or password';
      errorEl.style.display = 'block';
    }
  }
}

function setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  if (!tabs.length) return;
  const panels = {
    signin: document.getElementById('auth-signin-form'),
    signup: document.getElementById('auth-signup-form'),
  };
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        panel.classList.toggle('hidden', key !== tab.dataset.authTab);
      });
    });
  });
}

/* Gate: on the auth page, bounce logged-in users to home. On any gated
   page, bounce guests to the auth page. Admin page handles its own auth. */
function gatePage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const isAuthPage = path === 'index.html' || path === '' || path === '/';
  const isAdminPage = path === 'admin.html';
  const signedIn = Boolean(getSessionId() && currentUser.userId);

  if (isAuthPage && signedIn) {
    window.location.replace('home.html');
    return true;
  }
  if (!isAuthPage && !isAdminPage && !signedIn) {
    window.location.replace('index.html');
    return true;
  }
  return false;
}

function updateAccountUI() {
  const stats = getStats();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('stat-bookings', stats.totalBookings);
  set('stat-favorites', stats.totalFavorites);
  set('stat-member', stats.memberSince);
  set('stat-reviews', stats.totalReviews);
  set('display-user-id', currentUser.userId || 'Not Registered');
  set('display-user-email', currentUser.email || 'Not Registered');
  set('display-user-password', '••••••••');
  set('display-user-age', currentUser.ageRange || 'Not Specified');
  set('display-user-booking', currentUser.bookingPlace || 'None');
  set('display-user-date', currentUser.bookingDate || 'N/A');
  set('display-user-time', currentUser.bookingTime || 'N/A');

  const emailInput = document.getElementById('user-email');
  if (emailInput && currentUser.email) emailInput.value = currentUser.email;
  renderBookingHistory();
}

function showWelcomeNotification() {
  const n = document.createElement('div');
  n.className = 'welcome-pop';
  n.innerHTML = '✅ Welcome! Account created successfully.';
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

async function handleLogout() {
  const btn = document.getElementById('logout-btn');
  if (!confirm('Are you sure you want to logout?')) return;
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Logging out…'; }
  setSessionId('');
  currentUser.email = '';
  currentUser.ageRange = '';
  currentUser.bookings = [];
  currentUser.favorites = [];
  currentUser.bookingPlace = 'None';
  currentUser.bookingDate = 'N/A';
  currentUser.bookingTime = 'N/A';
  showToast('Logged out', 'success');
  setTimeout(() => (window.location.href = 'index.html'), 900);
}

function renderBookingHistory() {
  const container = document.getElementById('booking-history');
  if (!container) return;
  if (!currentUser.bookings || currentUser.bookings.length === 0) {
    container.innerHTML = '<p class="muted">No bookings yet. Head to Bookings to make one!</p>';
    return;
  }
  container.innerHTML = '<div class="history-list">' +
    currentUser.bookings.map((b) => `
      <div class="history-item">
        <strong>${escapeHTML(b.place)}</strong>
        <small>📅 ${escapeHTML(b.date)} at ${escapeHTML(b.time)}</small>
      </div>
    `).join('') + '</div>';
}

async function handleProfileEdit(event) {
  event.preventDefault();
  const emailInput = document.getElementById('user-email');
  const passwordInput = document.getElementById('user-password');
  const confirmInput = document.getElementById('profile-confirm-password');
  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirm = confirmInput ? confirmInput.value.trim() : password;

  if (!email || !password) return showToast('Please enter both email and password.', 'error');
  if (email.length < 6 || email.length > 60) return showToast('Email must be 6–60 chars.', 'error');
  if (password.length < 6) return showToast('Password must be at least 6 characters.', 'error');
  if (confirm && password !== confirm) return showToast('Passwords do not match.', 'error');

  try {
    const { user } = await api('/api/profile', { method: 'POST', body: { email, password } });
    currentUser.email = user.email;
    updateAccountUI();
    showToast('✅ Profile updated', 'success');
  } catch (err) {
    showToast(err.message || 'Could not update profile', 'error');
  }
}

/* Donations UI (payment selection) — unchanged from original */
function togglePaymentDetails(val) {
  const fields = ['card', 'bank', 'stripe', 'crypto'];
  fields.forEach((f) => { const el = document.getElementById(`${f}-fields`); if (el) el.style.display = 'none'; });
  const cryptoDisplay = document.getElementById('crypto-address-display');
  const cardFields = document.getElementById('card-fields');
  const stripeFields = document.getElementById('stripe-fields');
  const bankFields = document.getElementById('bank-fields');
  const cryptoFields = document.getElementById('crypto-fields');

  if (val === 'card' && cardFields) cardFields.style.display = 'block';
  else if (val === 'stripe' && stripeFields) stripeFields.style.display = 'block';
  else if (val === 'bank' && bankFields) bankFields.style.display = 'block';
  else if (val === 'bitcoin' && cryptoFields) {
    cryptoFields.style.display = 'block';
    cryptoDisplay.textContent = 'BTC Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
  } else if (val === 'crypto' && cryptoFields) {
    cryptoFields.style.display = 'block';
    cryptoDisplay.textContent = 'Multi-Crypto Wallet (ETH/USDT/USDC/SOL/BNB): 0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  } else if (val === 'paypal' && cryptoFields) {
    cryptoFields.style.display = 'block';
    cryptoDisplay.textContent = 'PayPal Redirect: donations@socialcircle.al';
  } else if ((val === 'wallets' || val === 'online') && cryptoFields) {
    cryptoFields.style.display = 'block';
    cryptoDisplay.textContent = 'Payment gateway will open on submit.';
  }
}

function copyBankDetails() {
  const box = document.getElementById('bank-details-display');
  if (!box) return;
  navigator.clipboard.writeText(box.innerText)
    .then(() => showToast('Bank details copied', 'success'))
    .catch(() => showToast('Unable to copy', 'error'));
}

async function handleDonationSubmit(event) {
  event.preventDefault();
  const method = document.getElementById('payment-method').value;
  const amountInput = document.getElementById('donation-amount');
  const amount = Number(amountInput ? amountInput.value || 0 : 0);
  const successBox = document.getElementById('donation-success');

  // Persist the donation so the admin dashboard can show it. Fire-and-forget
  // so a storage hiccup never blocks the UX — the user still sees success.
  if (getSessionId() && method && amount > 0) {
    api('/api/donations', { method: 'POST', body: { amount, method } }).catch(() => {});
  }

  if (method === 'stripe') {
    const url = new URL('https://buy.stripe.com/test_00g9Eo5mU4OQ4KQ7');
    if (amount > 0) url.searchParams.set('amount', String(Math.round(amount * 100)));
    window.location.href = url.toString();
    return;
  }

  if (successBox) {
    successBox.textContent = method === 'bank'
      ? 'Thank you! Please send the donation using the bank details shown above.'
      : 'Thank you! Your donation transaction has been processed successfully.';
    successBox.style.display = 'block';
  }
  document.getElementById('donation-form')?.reset();
  ['card-fields', 'bank-fields', 'stripe-fields', 'crypto-fields'].forEach((id) => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  setTimeout(() => { if (successBox) successBox.style.display = 'none'; }, 5000);
}

/* Community chat — server-backed */
async function loadChatHistory() {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  try {
    const { messages, sentByMe, limit } = await api('/api/chat');
    userChatCount = sentByMe;
    const countDisplay = document.getElementById('chat-count-display');
    if (countDisplay) countDisplay.textContent = userChatCount;
    chatMessages.innerHTML = messages.map(renderChatBubble).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (userChatCount >= limit) {
      const banner = document.getElementById('chat-error-banner');
      if (banner) banner.style.display = 'block';
    }
  } catch (err) {
    console.warn('Could not load chat history:', err);
  }
}
function renderChatBubble(m) {
  const mine = m.userId === currentUser.userId;
  return `
    <div class="chat-msg ${mine ? 'self' : 'other'}">
      <span class="chat-sender">${escapeHTML(m.author || m.userId)}</span>
      ${escapeHTML(m.text)}
    </div>`;
}

async function handleSendChat(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const errorBanner = document.getElementById('chat-error-banner');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatMessages = document.getElementById('chat-messages');
  if (!input || !chatMessages) return;
  const text = input.value.trim();
  if (!text) return;

  if (!getSessionId()) {
    showToast('Please register first to chat', 'error');
    return;
  }

  try {
    const { messages, sentByMe, limit } = await api('/api/chat', { method: 'POST', body: { text } });
    userChatCount = sentByMe;
    const countDisplay = document.getElementById('chat-count-display');
    if (countDisplay) countDisplay.textContent = userChatCount;
    chatMessages.innerHTML = messages.map(renderChatBubble).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    input.value = '';
    if (userChatCount >= limit) {
      if (errorBanner) errorBanner.style.display = 'block';
      input.disabled = true;
      if (sendBtn) sendBtn.disabled = true;
    }
  } catch (err) {
    if (err.status === 429) {
      if (errorBanner) errorBanner.style.display = 'block';
      input.disabled = true;
      if (sendBtn) sendBtn.disabled = true;
      showToast('Chat limit reached', 'error');
    } else {
      showToast(err.message || 'Could not send message', 'error');
    }
  }
}

/* DMs — server-backed */
async function loadDMHistory(peer) {
  const messages = document.getElementById('dm-messages');
  if (!messages) return;
  try {
    const { messages: list } = await api(`/api/dms?peer=${encodeURIComponent(peer)}`);
    messages.innerHTML = list.map((m) => {
      const mine = m.fromUserId === currentUser.userId;
      return `
        <div class="chat-msg ${mine ? 'self' : 'other'}">
          <span class="chat-sender">${mine ? 'You' : escapeHTML(m.fromUserId)}</span>
          ${escapeHTML(m.text)}
        </div>`;
    }).join('');
    messages.scrollTop = messages.scrollHeight;
  } catch (err) {
    console.warn('Could not load DM history:', err);
  }
}

async function handleSendDM(event) {
  event.preventDefault();
  const input = document.getElementById('dm-input');
  const messages = document.getElementById('dm-messages');
  const label = document.getElementById('dm-recipient-label');
  if (!input || !messages || !label) return;
  const text = input.value.trim();
  if (!text) return;

  if (!getSessionId()) {
    showToast('Please register first to send DMs', 'error');
    return;
  }

  const peer = label.textContent.trim() || 'USR-1001';
  try {
    const { messages: list } = await api('/api/dms', { method: 'POST', body: { to: peer, text } });
    messages.innerHTML = list.map((m) => {
      const mine = m.fromUserId === currentUser.userId;
      return `
        <div class="chat-msg ${mine ? 'self' : 'other'}">
          <span class="chat-sender">${mine ? `You → ${escapeHTML(peer)}` : escapeHTML(m.fromUserId)}</span>
          ${escapeHTML(m.text)}
        </div>`;
    }).join('');
    messages.scrollTop = messages.scrollHeight;
    input.value = '';
  } catch (err) {
    showToast(err.message || 'Could not send DM', 'error');
  }
}

function switchDMRecipient(value) {
  const label = document.getElementById('dm-recipient-label');
  if (label) label.textContent = value;
  loadDMHistory(value);
}

async function handleReportSubmit(event) {
  event.preventDefault();
  const reportedUser = document.getElementById('reported-user-id')?.value.trim();
  const reason = document.getElementById('report-reason')?.value;
  const description = document.getElementById('report-description')?.value.trim();
  if (!reportedUser || !reason || !description) {
    return showToast('Please fill in all report fields.', 'error');
  }
  if (!getSessionId()) return showToast('Please register first to file reports', 'error');

  try {
    await api('/api/reports', { method: 'POST', body: { reportedUser, reason, description } });
    const successBox = document.getElementById('report-success');
    if (successBox) {
      successBox.style.display = 'block';
      document.getElementById('report-form')?.reset();
      setTimeout(() => (successBox.style.display = 'none'), 4000);
    }
  } catch (err) {
    showToast(err.message || 'Could not submit report', 'error');
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  const bookingError = document.getElementById('booking-error');
  const selectedAge = currentUser.ageRange || '18-24';
  if (!selectedPlace) return;
  const [min, max] = [selectedPlace.minAge, selectedPlace.maxAge];
  const ageValue = parseAgeBucket(selectedAge);
  if (!(ageValue >= min && ageValue <= max)) {
    if (bookingError) bookingError.style.display = 'block';
    return;
  }

  if (!getSessionId()) {
    showToast('Please register first to book', 'error');
    return;
  }

  const bookingDate = document.getElementById('booking-date').value;
  const bookingTime = document.getElementById('booking-time').value;

  try {
    const { booking, bookings } = await api('/api/bookings', {
      method: 'POST',
      body: { venueId: selectedPlace.id, place: selectedPlace.name, date: bookingDate, time: bookingTime },
    });
    currentUser.bookings = bookings;
    currentUser.bookingPlace = booking.place;
    currentUser.bookingDate = booking.date;
    currentUser.bookingTime = booking.time;
    updateAccountUI();

    const modal = document.getElementById('booking-confirmation-modal');
    if (modal) {
      document.getElementById('confirm-place').textContent = selectedPlace.name;
      document.getElementById('confirm-date').textContent = bookingDate;
      document.getElementById('confirm-time').textContent = bookingTime;
      document.getElementById('confirm-email').textContent = currentUser.email;
      document.getElementById('confirm-userid').textContent = currentUser.userId;
      modal.style.display = 'flex';
    }
  } catch (err) {
    showToast(err.message || 'Could not create booking', 'error');
  }
}

/* Admin — logs into the DB and loads real data */
async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const authCode = document.getElementById('admin-2fa').value.trim();
  const dogName = document.getElementById('admin-dog').value.trim();
  const error = document.getElementById('admin-auth-error');

  if (!email || !password || !authCode || !dogName) {
    if (error) error.style.display = 'block';
    return;
  }
  if (!(authCode === 'APPROVED' || /^\d{6}$/.test(authCode)) || dogName.length < 2) {
    if (error) error.style.display = 'block';
    return;
  }

  try {
    const { user } = await api('/api/admin', { method: 'POST', body: { email, password } });
    setSessionId(user.userId);
    currentUser.email = user.email;
    if (error) error.style.display = 'none';
    document.getElementById('admin-login-view').style.display = 'none';
    document.getElementById('admin-dashboard-view').style.display = 'block';
    setupAdminTabs();
    await renderAdminTables();
    // Reveal the Admin pill-nav link now that we know we're admin.
    document.querySelectorAll('.pill-nav-admin').forEach((link) => link.classList.remove('hidden'));
  } catch {
    if (error) error.style.display = 'block';
  }
}

function adminLogout() {
  setSessionId('');
  document.getElementById('admin-login-view').style.display = 'block';
  document.getElementById('admin-dashboard-view').style.display = 'none';
}

async function renderAdminTables() {
  try {
    const { bookings, reports } = await api('/api/admin');
    const tbody = document.getElementById('spreadsheet-body');
    const reportTbody = document.getElementById('reports-spreadsheet-body');
    if (tbody) {
      tbody.innerHTML = bookings.length
        ? bookings.map((b) => `
          <tr>
            <td>${escapeHTML(b.userId)}</td>
            <td>${escapeHTML(b.email)}</td>
            <td>${escapeHTML(b.ageRange)}</td>
            <td>${escapeHTML(b.place)}</td>
            <td>${escapeHTML(b.date)}</td>
            <td>${escapeHTML(b.time)}</td>
            <td>${escapeHTML(new Date(b.createdAt).toLocaleString())}</td>
          </tr>
        `).join('')
        : '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No bookings yet.</td></tr>';
    }
    if (reportTbody) {
      reportTbody.innerHTML = reports.length
        ? reports.map((r) => `
          <tr>
            <td>${escapeHTML(r.id)}</td>
            <td>${escapeHTML(r.reporterEmail)}</td>
            <td>${escapeHTML(r.reportedUser)}</td>
            <td>${escapeHTML(r.reason)}</td>
            <td>${escapeHTML(r.description)}</td>
            <td>${escapeHTML(new Date(r.createdAt).toLocaleString())}</td>
            <td><button type="button" class="link-danger" data-admin-delete-report="${escapeHTML(r.id)}">Delete</button></td>
          </tr>
        `).join('')
        : '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No reports yet.</td></tr>';
      reportTbody.querySelectorAll('[data-admin-delete-report]').forEach((btn) =>
        btn.addEventListener('click', () => handleDeleteReport(btn.dataset.adminDeleteReport)),
      );
    }
  } catch (err) {
    showToast(err.message || 'Admin fetch failed', 'error');
  }
}

async function handleDeleteReport(reportId) {
  if (!confirm('Delete this report?')) return;
  try {
    await api(`/api/reports?id=${encodeURIComponent(reportId)}`, { method: 'DELETE' });
    showToast('Report deleted', 'success');
    renderAdminTables();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
}

/* ── Admin: Messages ── */
async function renderAdminMessages() {
  const chatBody = document.getElementById('admin-chat-body');
  const dmBody = document.getElementById('admin-dm-body');
  if (!chatBody && !dmBody) return;
  try {
    const { chat, dms } = await api('/api/admin/messages');
    if (chatBody) {
      chatBody.innerHTML = chat.length
        ? chat.map((m) => `
          <tr>
            <td>${escapeHTML(new Date(m.createdAt).toLocaleString())}</td>
            <td>${escapeHTML(m.author || m.userId)}</td>
            <td>${escapeHTML(m.text)}</td>
            <td><button type="button" class="link-danger" data-del-chat="${escapeHTML(m.id)}">Delete</button></td>
          </tr>
        `).join('')
        : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No chat messages yet.</td></tr>';
      chatBody.querySelectorAll('[data-del-chat]').forEach((btn) =>
        btn.addEventListener('click', () => handleDeleteMessage('chat', btn.dataset.delChat)),
      );
    }
    if (dmBody) {
      dmBody.innerHTML = dms.length
        ? dms.map((m) => `
          <tr>
            <td>${escapeHTML(new Date(m.createdAt).toLocaleString())}</td>
            <td>${escapeHTML(m.fromUserId)}</td>
            <td>${escapeHTML(m.toUserId)}</td>
            <td>${escapeHTML(m.text)}</td>
            <td><button type="button" class="link-danger" data-del-dm="${escapeHTML(m.id)}">Delete</button></td>
          </tr>
        `).join('')
        : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No DMs yet.</td></tr>';
      dmBody.querySelectorAll('[data-del-dm]').forEach((btn) =>
        btn.addEventListener('click', () => handleDeleteMessage('dm', btn.dataset.delDm)),
      );
    }
  } catch (err) {
    showToast(err.message || 'Messages fetch failed', 'error');
  }
}

async function handleDeleteMessage(kind, messageId) {
  if (!confirm(`Delete this ${kind === 'chat' ? 'chat message' : 'DM'}?`)) return;
  try {
    await api('/api/admin/messages', { method: 'POST', body: { kind, id: messageId } });
    showToast('Deleted', 'success');
    renderAdminMessages();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
}

/* ── Admin: Venues ── */
async function renderAdminVenues() {
  const body = document.getElementById('admin-venues-body');
  if (!body) return;
  try {
    const { venues } = await api('/api/admin/venues');
    body.innerHTML = venues.length
      ? venues.map((v) => `
        <tr>
          <td><code>${escapeHTML(v.id)}</code></td>
          <td>${escapeHTML(v.name)}</td>
          <td>${v.minAge}–${v.maxAge}</td>
          <td>${v.activeCount}</td>
          <td>${v.totalBookings}</td>
          <td>
            <button type="button" class="link" data-edit-venue="${escapeHTML(v.id)}">Edit</button>
            <button type="button" class="link-danger" data-del-venue="${escapeHTML(v.id)}">Delete</button>
          </td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No venues yet.</td></tr>';
    body.querySelectorAll('[data-edit-venue]').forEach((btn) =>
      btn.addEventListener('click', () => editVenueFromRow(btn.dataset.editVenue)),
    );
    body.querySelectorAll('[data-del-venue]').forEach((btn) =>
      btn.addEventListener('click', () => deleteVenueFromAdmin(btn.dataset.delVenue)),
    );
  } catch (err) {
    showToast(err.message || 'Venues fetch failed', 'error');
  }
}

async function editVenueFromRow(venueId) {
  try {
    const { venues } = await api('/api/admin/venues');
    const v = venues.find((x) => x.id === venueId);
    if (!v) return;
    document.getElementById('venue-id').value = v.id;
    document.getElementById('venue-name').value = v.name || '';
    document.getElementById('venue-image').value = v.image || '';
    document.getElementById('venue-description').value = v.description || '';
    document.getElementById('venue-location').value = v.locationUrl || '';
    document.getElementById('venue-min').value = v.minAge ?? 18;
    document.getElementById('venue-max').value = v.maxAge ?? 99;
    document.getElementById('venue-active').value = v.activeCount ?? 0;
    document.getElementById('venue-total').value = v.totalBookings ?? 0;
    document.getElementById('venue-dropdown').checked = Boolean(v.hasLocationsDropdown);
    document.getElementById('venue-name').focus();
  } catch (err) {
    showToast(err.message || 'Could not load venue', 'error');
  }
}

function resetVenueForm() {
  const form = document.getElementById('admin-venue-form');
  if (!form) return;
  form.reset();
  document.getElementById('venue-id').value = '';
}

async function handleAdminVenueSubmit(event) {
  event.preventDefault();
  const payload = {
    op: document.getElementById('venue-id').value ? 'update' : 'create',
    id: document.getElementById('venue-id').value || undefined,
    name: document.getElementById('venue-name').value.trim(),
    image: document.getElementById('venue-image').value.trim(),
    description: document.getElementById('venue-description').value.trim(),
    locationUrl: document.getElementById('venue-location').value.trim(),
    minAge: Number(document.getElementById('venue-min').value),
    maxAge: Number(document.getElementById('venue-max').value),
    activeCount: Number(document.getElementById('venue-active').value),
    totalBookings: Number(document.getElementById('venue-total').value),
    hasLocationsDropdown: document.getElementById('venue-dropdown').checked,
  };
  try {
    await api('/api/admin/venues', { method: 'POST', body: payload });
    showToast(payload.op === 'update' ? 'Venue updated' : 'Venue created', 'success');
    resetVenueForm();
    renderAdminVenues();
  } catch (err) {
    showToast(err.message || 'Save failed', 'error');
  }
}

async function deleteVenueFromAdmin(venueId) {
  if (!confirm(`Delete venue "${venueId}"?`)) return;
  try {
    await api('/api/admin/venues', { method: 'POST', body: { op: 'delete', id: venueId } });
    showToast('Venue deleted', 'success');
    renderAdminVenues();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
}

/* ── Admin: Donations ── */
async function renderAdminDonations() {
  const body = document.getElementById('admin-donations-body');
  if (!body) return;
  try {
    const { donations } = await api('/api/donations');
    body.innerHTML = donations.length
      ? donations.map((d) => `
        <tr>
          <td>${escapeHTML(new Date(d.createdAt).toLocaleString())}</td>
          <td>${escapeHTML(d.email)}</td>
          <td>${escapeHTML(d.method)}</td>
          <td>${Number(d.amount).toFixed(2)}</td>
          <td><button type="button" class="link-danger" data-del-donation="${escapeHTML(d.id)}">Delete</button></td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No donations yet.</td></tr>';
    body.querySelectorAll('[data-del-donation]').forEach((btn) =>
      btn.addEventListener('click', () => deleteDonationFromAdmin(btn.dataset.delDonation)),
    );
  } catch (err) {
    showToast(err.message || 'Donations fetch failed', 'error');
  }
}

async function deleteDonationFromAdmin(donationId) {
  if (!confirm('Delete this donation record?')) return;
  try {
    await api(`/api/donations?id=${encodeURIComponent(donationId)}`, { method: 'DELETE' });
    showToast('Donation deleted', 'success');
    renderAdminDonations();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
}

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  if (!tabs.length) return;
  const panels = document.querySelectorAll('.admin-panel');
  const loaders = {
    bookings: renderAdminTables,
    reports: renderAdminTables,
    messages: renderAdminMessages,
    venues: renderAdminVenues,
    donations: renderAdminDonations,
  };
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== tab.dataset.adminTab));
      const loader = loaders[tab.dataset.adminTab];
      if (loader) loader();
    });
  });
  document.getElementById('admin-venue-form')?.addEventListener('submit', handleAdminVenueSubmit);
  document.getElementById('venue-reset')?.addEventListener('click', resetVenueForm);
}

function renderTonightPane() {
  const pane = document.querySelector('.main-pane');
  if (!pane) return;
  const bookings = currentUser.bookings || [];
  const favorites = currentUser.favorites || [];
  const meetups = document.getElementById('stat-meetups');
  const seats = document.getElementById('stat-seats');
  const connections = document.getElementById('stat-connections');
  if (meetups) meetups.textContent = String(bookings.length);
  if (seats) seats.textContent = String(Math.max(0, bookings.length * 2));
  if (connections) connections.textContent = String(favorites.length);

  const avatar = document.getElementById('side-avatar');
  if (avatar) {
    const initial = (currentUser.email || 'A').trim().charAt(0).toUpperCase();
    avatar.textContent = initial || 'A';
  }

  // Hook up segmented posts toggle
  const segs = document.querySelectorAll('.posts-head .seg');
  segs.forEach((s) => s.addEventListener('click', () => {
    segs.forEach((x) => {
      x.classList.toggle('active', x === s);
      x.setAttribute('aria-selected', x === s ? 'true' : 'false');
    });
  }));

  // "New post" and "Your story" placeholders — surface a friendly toast
  document.getElementById('new-post-btn')?.addEventListener('click', () => {
    showToast('Posts arrive in a future update ✨', 'info');
  });
  document.querySelector('.story-tile')?.addEventListener('click', () => {
    showToast('Stories arrive in a future update ✨', 'info');
  });

  document.getElementById('side-create')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'booking.html';
  });
  document.getElementById('side-favourites')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(
      favorites.length ? `${favorites.length} favourite${favorites.length === 1 ? '' : 's'} saved` : 'No favourites yet — tap ☆ on a venue',
      'info',
    );
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initDarkMode();
  setupMobileMenu();
  await loadUserState();

  // Auth / page gate — may redirect and halt further init.
  if (gatePage()) return;

  setupAuthTabs();
  setupNavigationState();
  renderFeaturedHome();
  renderBookingList();
  loadDetailPageFromQuery();
  updateAccountUI();
  updateFavoriteButtons();
  renderTonightPane();

  // Fire-and-forget: record the visit if logged in.
  if (getSessionId()) {
    api('/api/activity', { method: 'POST', body: { action: 'page_visit' } }).catch(() => {});
  }

  const welcomeModal = document.getElementById('welcome-modal');
  if (welcomeModal) welcomeModal.style.display = hasRegisteredUser() ? 'none' : 'flex';

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('booking-date');
  if (dateInput) { dateInput.min = today; dateInput.value = today; }

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleDarkMode);

  const chatCountDisplay = document.getElementById('chat-count-display');
  if (chatCountDisplay) chatCountDisplay.textContent = userChatCount;

  // If we're on the chat page, hydrate from the DB.
  if (document.getElementById('chat-messages')) loadChatHistory();

  const dmSelect = document.getElementById('dm-recipient-select');
  if (dmSelect) {
    dmSelect.addEventListener('change', (e) => switchDMRecipient(e.target.value));
    const dmLabel = document.getElementById('dm-recipient-label');
    if (dmLabel) loadDMHistory(dmLabel.textContent.trim());
  }

  const searchBar = document.getElementById('venue-search');
  if (searchBar) searchBar.addEventListener('input', (e) => renderFilteredVenues(filterVenues(e.target.value)));

  const passwordInput = document.getElementById('initial-password');
  if (passwordInput) passwordInput.addEventListener('input', (e) => showPasswordStrength(e.target.value));

  const profilePasswordInput = document.getElementById('user-password');
  if (profilePasswordInput) {
    profilePasswordInput.addEventListener('input', (e) => updateStrengthBar('profile-password-strength', e.target.value));
  }

  const confirmPasswordInput = document.getElementById('confirm-password');
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('change', (e) => {
      const err = document.getElementById('confirm-password-error');
      const mismatch = passwordInput && e.target.value !== passwordInput.value;
      if (err) { err.textContent = mismatch ? 'Passwords do not match' : ''; err.style.display = mismatch ? 'block' : 'none'; }
      if (mismatch) showToast('Passwords do not match!', 'error');
    });
  }

  document.getElementById('export-data-btn')?.addEventListener('click', exportUserData);
  document.getElementById('print-booking-btn')?.addEventListener('click', () => window.print());
  document.getElementById('initial-registration-form')?.addEventListener('submit', handleInitialRegistration);
  document.getElementById('donation-form')?.addEventListener('submit', handleDonationSubmit);
  document.getElementById('chat-form')?.addEventListener('submit', handleSendChat);
  document.getElementById('dm-form')?.addEventListener('submit', handleSendDM);
  document.getElementById('report-form')?.addEventListener('submit', handleReportSubmit);
  document.getElementById('reservation-form')?.addEventListener('submit', handleBookingSubmit);
  document.getElementById('profile-edit-form')?.addEventListener('submit', handleProfileEdit);
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('admin-login-form')?.addEventListener('submit', handleAdminLogin);
  document.getElementById('payment-method')?.addEventListener('change', (e) => togglePaymentDetails(e.target.value));
  document.getElementById('auth-signin-form')?.addEventListener('submit', handleSignIn);
  document.getElementById('auth-signup-form')?.addEventListener('submit', handleInitialRegistration);
});
