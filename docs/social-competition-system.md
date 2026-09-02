# Social and competition system

COMPETE is the single social surface. The legacy `Friends` and `Accountability`
exports both resolve to `SquadTab`, so there is no parallel UI or state model.

## Data flow

- `users_public` stores searchable public identity, weekly league placement and
  the user's public streak/pet status.
- `friendships` uses a canonical document ID made from both UIDs and a `userIds`
  array so each user can subscribe only to relationships that include them.
- Accepting a friendship creates a private two-person `circle`. A circle can grow
  to 50 members and owns its `activities`, `reactions`, and `comments`.
- Completed missions publish one idempotent activity per circle. Only verified
  activity contributes to challenge scoring.
- `challenges` stores 1v1 terms and score. The callable backend locks both stakes;
  a scheduled worker settles expired arenas and pays the winner (or refunds ties).
- `nudges` is an authenticated outbox. The browser never receives the OneSignal
  REST key; a Firestore-triggered function dispatches the push by external user ID.

Firestore listeners update the feed, friend requests, league room and challenges
in real time. Mutations update the UI immediately and roll back if Firestore or a
callable function rejects them. Localhost/demo users receive deterministic social
fixtures stored separately in `localStorage`; production users never receive fake
members.

## Production deployment

Install and verify both packages:

```bash
npm install
npm --prefix functions install
npm run lint
npm run test:social
npm --prefix functions run build
```

Configure the server-only OneSignal secrets:

```bash
firebase functions:secrets:set ONESIGNAL_APP_ID
firebase functions:secrets:set ONESIGNAL_REST_API_KEY
```

Deploy the required backend resources:

```bash
firebase deploy --only firestore:rules,firestore:indexes,functions
```

The OneSignal client identifies each signed-in user with the Firebase UID. The
server targets that same value through OneSignal's `external_id` alias.

Invite URLs are handled on the web and by Capacitor's native URL listener.
Android declares the verified `https://t1ger.app/invite/*` intent and both native
platforms support the `t1ger://invite/*` fallback. Before shipping universal
links, publish Android `assetlinks.json` and Apple's `apple-app-site-association`
for the final signing/team identities on `t1ger.app`.

## Security boundary

Friendship acceptance, circle membership, comments, reactions, challenge terms
and nudge creation are constrained in `firestore.rules`. Coin escrow and payout,
push dispatch and challenge scoring execute with Admin SDK privileges in Cloud
Functions. Never move those operations into browser code or expose a OneSignal
REST key through a `VITE_` variable.
