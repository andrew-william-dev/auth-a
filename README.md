# DevPortal Frontend

A modern **React 19** developer portal UI for managing OAuth 2.0 client applications and authenticating users via the DevPortal IdP.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Pages & Routes](#pages--routes)
- [OAuth Login Integration](#oauth-login-integration)
  - [Initiating the Flow from Your App](#initiating-the-flow-from-your-app)
  - [Token Exchange](#token-exchange)
  - [SSO Behavior](#sso-behavior)
- [Deployment (Vercel)](#deployment-vercel)

---

## Features

- 🔐 **Auth** — Login / Signup with JWT session stored in `localStorage`
- 📊 **Dashboard** — Stats overview and registered app list
- 📱 **App Management** — Register, edit, delete OAuth client applications
- 👥 **User Management** — View, grant, and revoke per-app user access
- 📥 **Access Requests** — Browse and approve/deny access requests (admin)
- 📖 **Documentation** — Built-in integration guide for third-party developers
- ⚡ **OAuth SSO** — Auto-redirects on the OAuth login page if a valid session exists
- 📱 **Responsive** — Mobile hamburger menu, responsive grids and tables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Bundler | Vite 7 |
| Routing | React Router DOM v7 |
| HTTP | Axios |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx          # DevPortal login page
│   │   │   └── Signup.jsx         # DevPortal signup page
│   │   ├── layout/
│   │   │   ├── Layout.jsx         # Shell with mobile header + hamburger menu
│   │   │   └── Sidebar.jsx        # Navigation sidebar
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx      # Stats + registered apps
│   │   ├── apps/
│   │   │   ├── RegisterApp.jsx    # Create OAuth client form
│   │   │   ├── BrowseApps.jsx     # Discover available apps
│   │   │   ├── ManageRequests.jsx # Admin: approve/deny access requests
│   │   │   ├── ManageAppUsers.jsx # Admin: manage per-app users
│   │   │   └── CredentialsModal.jsx # One-time display of clientSecret
│   │   ├── docs/
│   │   │   └── Documentation.jsx  # Integration guide
│   │   └── oauth/
│   │       ├── OAuthLogin.jsx     # OAuth authorization + SSO redirect
│   │       └── OAuthSignup.jsx    # Register via OAuth flow
│   ├── context/
│   │   ├── AuthContext.jsx        # Global auth state + localStorage token
│   │   └── ToastContext.jsx       # Toast notifications
│   ├── services/
│   │   └── api.js                 # Axios instance with auth interceptor
│   ├── App.jsx                    # Route definitions
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Design system (CSS variables, components)
├── vercel.json                    # SPA routing fix for Vercel
├── .env                           # Local env vars
├── .env.production                # Production env vars
└── package.json
```

---

## Environment Variables

**`.env`** (local development):
```env
VITE_API_URL=http://localhost:5000/api
```

**`.env.production`** (Vercel production build):
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

> Vite automatically uses `.env.production` during `npm run build`.

---

## Running Locally

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Other commands:
```bash
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint
```

---

## Pages & Routes

| Route | Component | Auth Required | Description |
|-------|-----------|:---:|-------------|
| `/` | Login | ❌ | DevPortal login |
| `/signup` | Signup | ❌ | DevPortal registration |
| `/dashboard` | Dashboard | ✅ | App stats and list |
| `/browse-apps` | BrowseApps | ✅ | Discover all apps |
| `/manage-requests` | ManageRequests | ✅ admin | Approve/deny requests |
| `/documentation` | Documentation | ✅ | Integration guide |
| `/oauth/login` | OAuthLogin | ❌ | OAuth authorization page |
| `/oauth/signup` | OAuthSignup | ❌ | Register via OAuth flow |

---

## OAuth Login Integration

Third-party apps use DevPortal as their Identity Provider via the **OAuth 2.0 Authorization Code + PKCE** flow.

### Initiating the Flow from Your App

Redirect your users to:
```
https://auth-a.vercel.app/oauth/login
  ?clientId=app_xxxxxxxxxxxxxxxx
  &redirectUrl=https://yourapp.com/callback
  &code_challenge=<BASE64URL(SHA256(verifier))>
  &code_challenge_method=s256
```

**Generating PKCE values (browser):**
```js
// 1. Generate code_verifier
const array = new Uint8Array(32);
crypto.getRandomValues(array);
const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

// 2. Generate code_challenge (S256)
const encoder = new TextEncoder();
const data = encoder.encode(verifier);
const digest = await crypto.subtle.digest('SHA-256', data);
const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
```

Store `verifier` in `sessionStorage` — you'll need it for the token exchange.

### Token Exchange

After the user authorizes, DevPortal redirects to:
```
https://yourapp.com/callback?code=<auth_code>
```

Exchange the code for an access token:
```js
const response = await fetch('https://auth-a-be.onrender.com/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: new URLSearchParams(window.location.search).get('code'),
        code_verifier: sessionStorage.getItem('pkce_verifier'),
        clientId: 'app_xxxxxxxxxxxxxxxx',
    }),
});

const { access_token, user, role } = await response.json();
```

The returned JWT contains:
```json
{
  "userId": "...",
  "username": "alice",
  "email": "alice@example.com",
  "clientId": "app_xxx",
  "role": "viewer"
}
```

### SSO Behavior

If the user navigating to `/oauth/login` already has a **valid, non-expired DevPortal JWT** in their `localStorage`:

1. The page shows **"Session found! Redirecting to [App]..."**
2. Calls `POST /api/oauth/authorize-with-token` with the stored token
3. Immediately redirects to `redirectUrl?code=...`

**No login form is shown.** This provides a seamless SSO experience.

If the token is expired, missing, or the user doesn't have access to the app, the normal login form is displayed as a fallback.

---

## Deployment (Vercel)

1. Push frontend to GitHub
2. Import the repo into [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy

The `vercel.json` at the root of `frontend/` handles SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
This prevents 404 errors when navigating directly to any route (e.g. `/dashboard`).

---

## License

© 2024 DevPortal. All rights reserved.
