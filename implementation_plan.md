# Goal: Implement Comprehensive Edge-Compatible Middleware Security

This plan outlines the steps to secure the CrisisConnect application by implementing a Next.js `middleware.ts`. This middleware will cryptographically verify the JWT cookie on **every single page load and API hit** at the edge, ensuring no unauthorized access is possible.

## User Review Required

> [!IMPORTANT]
> **Total Lockdown:** This middleware will lock down the entire application. The *only* public paths will be `/signin`, `/signup`, `/api/auth/login`, and `/api/auth/register`. Even previously unprotected APIs like `GET /api/tasks` will now return a 401 if accessed without logging in. Let me know if you need any other pages/APIs to remain public.
> 
> **Edge Runtime Dependency:** We will need to install `jose` (`npm install jose`). The current `jsonwebtoken` library does not work in Next.js Middleware because it relies on Node.js built-ins which aren't available at the Edge. `jose` is the standard solution for this.

## Proposed Changes

### 1. Install Dependencies
Run `npm install jose` to support edge-compatible JWT verification.

### 2. Create Middleware
#### [NEW] [middleware.ts](file:///c:/Users/Aryan_/Documents/GitHub/crisis-connect/middleware.ts)
- Create a middleware that intercepts all requests.
- Exclude Next.js static assets and images from the matcher.
- **Logic:**
  1. Define public paths (`/signin`, `/signup`, `/api/auth/login`, `/api/auth/register`, `/`).
  2. If the user tries to access a protected path without a valid `token` cookie, redirect them to `/signin` (or return `401 Unauthorized` for API routes).
  3. Verify the token cryptographically using `jose`.
  4. Enforce Role-Based Access Control (RBAC): If an NGO tries to access `/volunteer-dashboard`, redirect them to `/ngo-dashboard`, and vice versa.
  5. **Inject Headers:** The middleware will inject `x-user-id` and `x-user-role` into the request headers. This means our API routes won't have to manually verify the token anymore—they can just trust the middleware's headers!

### 3. Refactor API Routes
Since the middleware will guarantee that any request hitting an API route (except public auth routes) is already authenticated, we will clean up and secure all API routes by removing the manual `getAuthToken`/`verifyAuthToken` calls and replacing them with header checks.

#### [MODIFY] All protected API routes:
- `app/api/tasks/route.ts` (Securing both GET and POST)
- `app/api/tasks/[id]/route.ts`
- `app/api/tasks/[id]/accept/route.ts`
- `app/api/tasks/[id]/leave/route.ts`
- `app/api/ngos/route.ts` (Securing the GET route)
- `app/api/ngo-requests/route.ts`
- `app/api/notifications/route.ts`
- `app/api/auth/profile/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/gemini/analyze/route.ts`
- `app/api/gemini/recommend/route.ts`
- `app/api/volunteer/resonance/route.ts`

**Example Refactor:**
```typescript
// Old way
const token = getAuthToken(request);
const decoded = verifyAuthToken(token, env.JWT_SECRET);
const userId = decoded.userId;

// New secure way (guaranteed by middleware)
const userId = request.headers.get('x-user-id');
const role = request.headers.get('x-user-role');
```

## Verification Plan

### Automated/Manual Testing
- Stop the dev server, install `jose`, and restart.
- **Unauthenticated Access:** Open an Incognito window and try to access `/ngo-dashboard` and `http://localhost:3000/api/tasks`. Verify it redirects to `/signin` or returns `401`.
- **Authenticated Access:** Log in as an NGO and verify task creation still works.
- **RBAC Check:** Log in as an NGO and manually type `/volunteer-dashboard` into the URL bar. Verify it redirects back to `/ngo-dashboard`.
