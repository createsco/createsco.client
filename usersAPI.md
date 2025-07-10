# Users API Documentation

This document explains the **`usersAPI`** Express router found at the root of the backend code-base (file: `.usersAPI`).  
It contains all the routes related to authentication and user management for the Pixisphere platform.

---

## Tech Stack & Dependencies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Web framework | **Express.js** | HTTP routing & middleware. |
| AuthN/AuthZ | **Firebase Auth (admin-sdk)** | Token verification, email verification, token revocation. |
| Database | **MongoDB + Mongoose** | Persistent user, client & partner data. |
| Email | **Nodemailer** (utils/emailService) | Welcome emails & login notifications. |
| Security middleware | Custom modules in `middleware/*` | Input sanitisation, device fingerprinting & schema validation. |

The router assumes the following Mongoose models are available:

* `User` — core user document.
* `Client` — extra fields for customers who hire partners.
* `Partner` — extra fields & profile for service providers.

---

## Global Middleware

| Middleware | Applied To | Notes |
|------------|-----------|-------|
| `sanitizeInput` | **ALL** routes | Strips / escapes malicious characters to mitigate XSS / NoSQL-injection. |
| `deviceFingerprinting` | **ALL** routes | Adds `req.deviceInfo` describing OS / browser / IP etc. Used for login alerts. |
| `validateUserRegistration` | **/register** only | Joi / Zod schema validating signup payload. |
| `verifyFirebaseToken` | Protected routes | Parses the `Authorization: Bearer <jwt>` header, verifies via Firebase Admin SDK and attaches `req.user`. |

---

## Rate-Limit / Brute-Force Protection

`failedAttempts` – an in-memory `Map` keyed by client IP tracks consecutive failed logins.

* 5 failed attempts within 15 minutes ⇒ subsequent attempts return **HTTP 429** for the next 15 minutes.
* House-keeping job clears stale IPs every hour. (In production, switch to a Redis/Mongo collection.)

---

## Transaction Handling

Several routes (`/register`, `/delete-account`) create a **session** via `User.startSession()` and wrap DB operations in `session.withTransaction(...)` to guarantee atomicity across multiple collections (`User`, `Client`, `Partner`).

---

## Routes

### 1. `POST /register`
Registers a new user **after** the front-end already created a Firebase account and obtained a UID.

```http
POST /register
Content-Type: application/json
```

#### Request Body
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `firebaseUid` | `string` | ✓ | Firebase UID; verified to exist. |
| `username` | `string` | ✓ | Unique handle. |
| `email` | `string` | ✓ | Must match Firebase email. |
| `userType` | `"client" \| "partner"` | ✓ | Determines secondary collection. |
| `phone` | `string` | — | Optional. |
| `address` | `string` | — | Optional. |

#### Success `201`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "<mongodb_id>",
      "firebaseUid": "<uid>",
      "username": "...",
      "email": "...",
      "userType": "client",
      "emailVerified": false
    }
  }
}
```
Creates a matching `Client` or `Partner` document and sends a **welcome email**.

#### Errors `400`
* Duplicate email / username / UID.  
* Firebase user not found.

### 2. `POST /login`
Verifies Firebase token, updates last-login info and returns enriched user data.

Protected by `verifyFirebaseToken`.

#### Success `200`
* Clears failed-attempt counter.
* Sends **login notification email** (if `req.deviceInfo` available).
* If user is a **client** ⇒ populates `favouritePartners`.  
  If **partner** ⇒ returns `partnerProfile`.

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "username": "...",
      "userType": "partner",
      "partnerProfile": { /* ... */ }
    }
  }
}
```

#### Errors
| Code | Reason |
|------|--------|
| 404 | User not found (also increments failed-attempt counter). |
| 429 | Too many failed attempts. |
| 500 | Misc server error. |

### 3. `POST /logout`
Revokes all Firebase **refresh tokens** for the user, effectively logging out other sessions as well.

#### Response `200`
```json
{ "success": true, "message": "Logged out successfully" }
```

### 4. `DELETE /delete-account`
Soft-deletes the Mongo **User** document and removes the Firebase account.

*Transactional*: if either delete fails, the session aborts and data is intact.

#### Response `200`
```json
{ "success": true, "message": "Account deleted successfully" }
```

### 5. `POST /verify-email`
Synchronises email-verification status with Firebase.

* If `req.user.emailVerified` is true ⇒ sets `user.emailVerified = true`.
* Otherwise returns **400**.

### 6. `GET /me`
Returns the currently authenticated user's document.

#### Response `200`
```json
{ "success": true, "data": { "user": { /* fields */ } } }
```

---

## Email Workflows

1. **sendWelcomeEmail** – after registration.
2. **sendLoginNotification** – after each successful login, includes device / IP details.

Both are fire-and-forget; failures are logged but don't block API responses.

---

## Error Handling Pattern
All error responses follow a uniform schema:

```json
{
  "success": false,
  "message": "<human readable message>"
}
```

Server errors are logged to console for observability.

---

## Security Considerations & TODOs

* **In-memory** rate-limit map is ephemeral – migrate to Redis or a Mongo collection when scaling to multiple instances.
* Consider using **helmet**, **cors** and HTTPS enforcement in the main app.
* The registration endpoint trusts client-provided `firebaseUid`; ensure this is obtained immediately after Firebase sign-up on the front-end.
* Add unit & integration tests for transaction rollbacks.

---

## How To Mount The Router

```js
const usersRouter = require("./path/to/.usersAPI")
app.use("/api/users", usersRouter)
```

Example final endpoints:
* `POST /api/users/register`
* `POST /api/users/login`
* ... etc.

---

© Pixisphere – User Management API 