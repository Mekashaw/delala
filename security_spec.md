# Firestore Security Specifications & Invariants

## 1. Core Data Invariants

*   **Listings (`/listings/{listingId}`)**:
    *   No anonymous document creation without valid structure.
    *   Any user can query/list/get approved listings publicly.
    *   Admin user (`role === 'admin'`) can approve, reject, or edit any listing.
    *   Standard users can create standard listings in `pending` status.

*   **Chats (`/chats/{chatId}`)**:
    *   Must have valid sender and receiver identities.
    *   Regular users can only view their own chat conversations (where `senderId` or `receiverId` matches their email address).
    *   Administrators can view all chat messages.

*   **Announcements (`/announcements/{announcementId}`)**:
    *   Read-only for regular users and public guest devices.
    *   Writeable/editable only by admin coordinators.

*   **Requests (`/requests/{requestId}`)**:
    *   Writable by any visitors or logged-in users.
    *   Read-only or admin-restricted depending on status and details.

*   **Users (`/users/{userEmail}`)**:
    *   A user can only read and write their own specific profile document (where key is their matching authenticated email or identifier).
    *   No privilege escalation is allowed (cannot write `role: 'admin'`).

---

## 2. The "Dirty Dozen" Exploit Payloads (Tested and Prevented)

1.  **Direct Admin Escalation**: Attacker registers an account with `role: 'admin'` to gain unrestricted system control.
2.  **Listing Poisoning (Junk Payload)**: Attacker attempts to post a 10MB text block as a listing description or empty categories.
3.  **Chat Snooping**: User `A` queries and reads support chats between User `B` and the administrative account.
4.  **Transaction Spoofing**: Regular customer edits historical deal logs in `announcements` to write positive or negative fake news under a competitor.
5.  **Status Altering Bypass**: User edits their own pending listing directly to mark it as `approved` without admin verification.
6.  **Owner Hijacking**: User `A` attempts to edit or delete User `B`'s submitted match request by guessing the ID.
7.  **No-Auth Write**: Unauthenticated agent submits listings with empty phone numbers and corrupt fields.
8.  **Empty Identifier Spam (ID Poisoning)**: Interceptor posts a request with ID `.........` in attempts to break routing.
9.  **Date Spammer**: Direct client submits listing with a bogus `dateAdded` (e.g. Year 3000) to stick to the top.
10. **Admin Deletion Attack**: External caller attempts to delete the site coordinator's master account.
11. **Orphaned Request Injection**: Caller assigns a request to a non-existent parent categories to stall the parser.
12. **Price Zero / Negative Bomb**: Customer tries to submit a listing with a negative pricing scheme (e.g. `-50,000` ETB).

---

## 3. High-Security Defenses (The Fortress Rules)

Rules are structured inside the final `firestore.rules` containing:
*   Default Deny gate.
*   Type, size, and format validation helpers.
*   Explicit non-relational to relational separation to safeguard performance.
