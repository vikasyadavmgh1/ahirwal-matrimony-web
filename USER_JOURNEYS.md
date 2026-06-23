# Ahirwal Matrimony — User Journeys

All key flows a user goes through in the app. Each journey has a starting point,
expected steps, and the correct end state. Used as the test checklist before every release.

---

## 1. New User Registration

**Trigger:** First time the phone number is used.

```
/login
  → Enter phone → Send OTP
  → Enter OTP → Verify
  → isNewUser = true  ← backend flag
  → Redirect to /profile/edit  (NOT dashboard)
  → Banner: "Welcome! Complete your profile to start finding matches"
  → Fill name, gender, DOB, gotra, education, occupation
  → Save Profile → redirect to /dashboard
  → Dashboard shows profile completion % and CTA if < 80%
```

**Broken today:** After login, always goes to /dashboard even for new users.

---

## 2. Returning User Login

**Trigger:** Phone already registered, has a profile.

```
/login
  → Enter phone → Send OTP
  → Enter OTP → Verify
  → isNewUser = false
  → Redirect to /dashboard
  → Dashboard shows match suggestions
```

---

## 3. Returning User — No Profile Yet

**Trigger:** Phone registered but profile never created (edge case: account exists, skipped profile).

```
/login → verify → /dashboard
  → Dashboard shows "Complete your profile" banner (profileCompletePct = 0)
  → Click "Complete Profile" → /profile/edit
  → Fill and save → redirect back to /dashboard
```

---

## 4. Browse & Discover Matches

```
/dashboard or /matches
  → See match cards (scored by compatibility)
  → Click a card → /profile/:id (view full profile)
  → Profile shows: name, age, gotra, education, occupation, location, photos, about
  → Actions: Send Interest | Shortlist
```

**Gap today:** Profile detail page (/profile/:id) doesn't have Send Interest or Shortlist buttons.

---

## 5. Send Interest

```
/profile/:id
  → Click "Send Interest"
  → Optional message input
  → Submit → toast "Interest sent!"
  → Button changes to "Interest Sent" (disabled)
```

**Gap today:** No Send Interest button on profile/:id page.

---

## 6. Receive & Manage Interests

```
/interests (Received tab)
  → See pending interests with sender name/photo
  → Accept → toast "Interest accepted! You can now chat"
            → Chat button appears
  → Decline → interest removed from list
  → Pending count shown on nav badge
```

---

## 7. Chat with a Match

```
/chat
  → List of accepted matches with last message preview
  → Click conversation → /chat/:conversationId
  → Message input at bottom
  → Send message → appears in thread
  → Real-time via WebSocket
```

**Gap today:** /chat/:conversationId page doesn't exist yet.

---

## 8. Shortlist a Profile

```
/profile/:id
  → Click bookmark icon → added to shortlist → icon fills
  → Click again → removed from shortlist
/shortlist
  → See all shortlisted profiles
  → Click → goes to /profile/:id
  → Remove button on each card
```

**Gap today:** No shortlist/bookmark button on profile/:id page.

---

## 9. Edit Own Profile

```
/profile (own)
  → Click Edit button → /profile/edit
  → Form pre-filled with existing data
  → Change any field → Save
  → Redirect back to /profile
  → Completion % updates
```

---

## 10. Upload Profile Photo

```
/profile/edit
  → Click avatar area / "Upload Photo"
  → File picker opens
  → Select image → uploads to S3 via presigned URL
  → Avatar preview updates
  → Save profile
```

**Gap today:** No upload UI on edit page.

---

## 11. Search & Filter

```
/matches
  → Search bar: type name → results filter live
  → Filter panel (Filter button):
      - Age range
      - Education level
      - Occupation
      - District
  → Apply → results update
```

**Gap today:** Filter panel opens but has no actual filter controls yet.

---

## 12. Logout

```
Sidebar → "Log out"
  → Tokens cleared from localStorage
  → Redirect to /login
  → toast "Logged out"
```

---

## 13. Admin Flow

```
Login with ADMIN role phone
  → /admin/dashboard (needs admin nav item)
  → Stats: total users, pending reports, active subscriptions
  → /admin/users — list + ban button
  → /admin/reports — pending reports + action buttons
  → /admin/profiles/:id/verify — verify button
```

**Gap today:** No admin pages in the frontend yet.

---

## Priority Fixes (this sprint)

| # | Journey | Fix needed |
|---|---------|-----------|
| 1 | New user → profile edit | Check `isNewUser` after login, redirect to /profile/edit |
| 2 | Profile/:id missing actions | Add Send Interest + Shortlist buttons |
| 3 | Chat conversation page | Create /chat/:id page with message thread |
| 4 | Filter panel | Add actual filter controls |
| 5 | Photo upload UI | Add avatar upload to edit page |
| 6 | Interest badge on nav | Show unread/pending count |

---

## Test Phone Numbers (local dev only)

| Phone | OTP | Purpose |
|-------|-----|---------|
| +910000000000 | 000000 | Always works in dev mode (AWS_ENDPOINT_OVERRIDE set) |
| +919876543210 | printed in backend log | Regular test number |
