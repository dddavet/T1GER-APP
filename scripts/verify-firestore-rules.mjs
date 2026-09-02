import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp, setLogLevel } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';

setLogLevel('silent'); // Expected permission-denied assertions otherwise flood CI logs.
const env = await initializeTestEnvironment({
  projectId: 'demo-t1ger',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  storage: { rules: readFileSync('storage.rules', 'utf8') },
});
try {
  await env.clearFirestore();
  const alice = env.authenticatedContext('alice', { email: 'alice@example.com' });
  const bob = env.authenticatedContext('bob', { email: 'bob@example.com' });
  const outsider = env.authenticatedContext('eve', { email: 'eve@example.com' });
  const user = { uid: 'alice', email: 'alice@example.com', niche: 'investing', xp: 0, streak: 0, level: 1, coins: 0 };
  for (const override of [{ xp: 1000 }, { role: 'founder' }, { isPro: true }, { weeklyXP: 100 }, { uid: 'bob' }, { level: 20 }, { missionCompletedToday: true }, { lastMissionDate: serverTimestamp() }]) {
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice'), { ...user, ...override }));
  }
  await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice'), user));
  await assertSucceeds(updateDoc(doc(alice.firestore(), 'users/alice'), { displayName: 'Alice', onboardingComplete: true }));
  for (const field of ['xp', 'coins', 'streak', 'weeklyXP', 'verifiedXP', 'level', 'verifiedMissionCount', 'isPro', 'isSuperT1ger', 'role', 'isFounder', 'timeZone', 'leagueCohortId']) {
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice'), { [field]: field.startsWith('is') ? true : 999 }));
  }
  await assertFails(getDoc(doc(bob.firestore(), 'users/alice')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users_public/alice')));
  await assertSucceeds(setDoc(doc(alice.firestore(), 'users_public/alice'), { uid: 'alice', displayName: 'Alice' }));
  await assertFails(updateDoc(doc(alice.firestore(), 'users_public/alice'), { weeklyXP: 500 }));
  await assertFails(updateDoc(doc(alice.firestore(), 'users_public/alice'), { leagueCohortId: 'easier-room' }));
  await assertFails(setDoc(doc(alice.firestore(), 'submissions/fake'), { userId: 'alice', verified: true, evidenceKind: 'text' }));
  await assertFails(setDoc(doc(alice.firestore(), 'missions/fake'), { userId: 'alice', status: 'verified' }));

  const friendship = { userIds: ['alice', 'bob'], userId1: 'alice', userId2: 'bob', requesterId: 'alice', addresseeId: 'bob', status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await assertFails(setDoc(doc(alice.firestore(), 'friendships/forged'), { ...friendship, userIds: ['alice', 'eve'] }));
  await assertSucceeds(setDoc(doc(alice.firestore(), 'friendships/alice_bob'), friendship));
  await assertFails(updateDoc(doc(alice.firestore(), 'friendships/alice_bob'), { status: 'accepted' }));
  await assertSucceeds(updateDoc(doc(bob.firestore(), 'friendships/alice_bob'), { status: 'accepted' }));
  const circle = { name: 'Squad', members: ['alice', 'bob'], ownerId: 'alice', friendshipId: 'alice_bob', weeklyScore: 0, inviteCode: 'AB', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await assertFails(setDoc(doc(outsider.firestore(), 'circles/friendship_alice_bob'), { ...circle, members: ['alice', 'eve'] }));
  await assertSucceeds(setDoc(doc(bob.firestore(), 'circles/friendship_alice_bob'), circle));
  const challenge = { senderId: 'alice', receiverId: 'bob', participantIds: ['alice', 'bob'], senderName: 'Alice', receiverName: 'Bob', durationDays: 7, metric: 'missions', stakeCoins: 10, potCoins: 20, status: 'pending', startsAt: null, endsAt: null, senderScore: 0, receiverScore: 0, createdAt: serverTimestamp() };
  await assertFails(setDoc(doc(alice.firestore(), 'challenges/injected'), { ...challenge, escrowCoins: 100000 }));
  await assertFails(setDoc(doc(alice.firestore(), 'challenges/injected'), { ...challenge, senderScore: 100 }));
  await assertSucceeds(setDoc(doc(alice.firestore(), 'challenges/ab'), challenge));
  await assertFails(updateDoc(doc(bob.firestore(), 'challenges/ab'), { status: 'active' }));
  await assertSucceeds(updateDoc(doc(bob.firestore(), 'challenges/ab'), { status: 'declined' }));
  await assertFails(setDoc(doc(alice.firestore(), 'nudges/spam'), { senderId: 'alice', receiverId: 'bob', status: 'queued' }));

  const activity = { userId: 'alice', userName: 'Alice', userAvatar: '', missionId: 'field-learn-money-01', missionTitle: 'Money', missionType: 'apply', durationMinutes: 3, verified: true, proofLabel: 'Verified', proofURL: 'https://example.com/proof', reactionCounts: { fire: 0, tiger: 0, respect: 0 }, reactedBy: {}, commentCount: 0, createdAt: serverTimestamp() };
  const activityPath = 'circles/friendship_alice_bob/activities/proof';
  await assertFails(setDoc(doc(alice.firestore(), activityPath), activity));
  await env.withSecurityRulesDisabled(async admin => {
    await setDoc(doc(admin.firestore(), 'submissions/alice_field-learn-money-01'), { userId: 'alice', verified: true, verificationTier: 'ai_reviewed_artifact', proofURL: activity.proofURL });
    await uploadBytes(ref(admin.storage(), 'proofs/alice/field-learn-money-01/a.png'), new Uint8Array([1, 2, 3]));
  });
  await assertSucceeds(setDoc(doc(alice.firestore(), activityPath), activity));
  await assertFails(updateDoc(doc(bob.firestore(), activityPath), { reactionCounts: { fire: 999, tiger: 0, respect: 0 } }));
  await assertFails(updateDoc(doc(alice.firestore(), 'submissions/alice_field-learn-money-01'), { proofURL: 'https://example.com/swapped' }));
  await assertSucceeds(getBytes(ref(alice.storage(), 'proofs/alice/field-learn-money-01/a.png')));
  await assertFails(getBytes(ref(bob.storage(), 'proofs/alice/field-learn-money-01/a.png')));
  await assertFails(uploadBytes(ref(alice.storage(), 'proofs/alice/field-learn-money-01/a.png'), new Uint8Array([4])));
  console.log('PASS: account defaults, protected rewards/roles, escrow, friendships, private proofs, immutable evidence, social verification and reactions.');
} finally {
  await env.cleanup();
}
