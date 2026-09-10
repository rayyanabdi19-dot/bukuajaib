# Firestore Security Specification & Invariants

## 1. Data Invariants

- **Events**: A wedding event (`/events/{eventId}`) must have a valid `id`, `ownerId`, `coupleTitle`, and cannot have arbitrary extra fields. The `ownerId` is immutable upon updates.
- **Guests**: A guest record (`/events/{eventId}/guests/{guestId}`) must belong to an existing parent event, must have valid non-empty `name`, `category`, `party`, `guestCount` (1..20), and valid `envelopeAmount` (>= 0).
- **Activity Logs**: An activity log (`/events/{eventId}/logs/{logId}`) is append-only / immutable once created. It records check-ins, envelope cashier entries, and souvenir transactions.
- **User Profiles**: Stored at `/users/{userId}` where `userId` strictly matches `request.auth.uid`. Role manipulation by non-admins is prevented.
- **Bootstrapped Admin**: `rayyan.abdi19@gmail.com` is granted administrative access.

---

## 2. The "Dirty Dozen" Threat Payloads (Negative Tests)

1. **Unauthenticated Read/Write**: Attempting to read or write without a valid auth token must return `PERMISSION_DENIED`.
2. **Unverified Email Write**: Attempting write operations when `request.auth.token.email_verified != true` must return `PERMISSION_DENIED`.
3. **ID Poisoning Attack**: Passing an invalid document ID (e.g., path traversal, 1KB length, illegal characters `$$$/hack`) must be rejected by `isValidId()`.
4. **Shadow Field Injection**: Writing an extra unlisted field (e.g., `{ isHacked: true }` or `{ role: "admin" }`) during creation must return `PERMISSION_DENIED`.
5. **Denial-of-Wallet Long Strings**: Supplying a guest name or notes string exceeding length bounds (e.g., > 100 characters for name or > 300 for notes) must return `PERMISSION_DENIED`.
6. **Owner Spoofing on Create**: Creating an event with an `ownerId` that does not match `request.auth.uid` must return `PERMISSION_DENIED`.
7. **Owner Mutation on Update**: Attempting to transfer event ownership by changing `ownerId` must return `PERMISSION_DENIED`.
8. **Negative Guest Count / Envelope Amount**: Passing negative numbers for `guestCount` or `envelopeAmount` must return `PERMISSION_DENIED`.
9. **Invalid Enum Values**: Setting `party` to anything other than `"laki"` or `"perempuan"` or `envelopeStatus` to an invalid enum must return `PERMISSION_DENIED`.
10. **Orphaned Guest Subcollection Write**: Creating a guest under a non-existent `eventId` must be rejected via parent existence checks.
11. **Activity Log Tampering**: Attempting to update or delete an immutable `ActivityLog` document must return `PERMISSION_DENIED`.
12. **PII Blanket Scraping**: Listing or fetching arbitrary user documents without ownership or admin privilege must return `PERMISSION_DENIED`.
