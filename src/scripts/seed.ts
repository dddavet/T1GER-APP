import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const insights = [
  { id: '1', title: 'The Value Equation', summary: 'Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort).', explanation: 'This is the core of everything. If you want to charge more, you must increase the numerator or decrease the denominator. Most people focus on the price, which is the wrong lever. Focus on the value.', criticalAnalysis: { works: 'Great for framing offers.', fails: 'Doesn\'t account for market size.', target: 'Entrepreneurs.' }, exercises: [{ name: 'Value Audit', objective: 'Audit your offer', instructions: 'Write down your offer and apply the equation.', frequency: 'Once', successMetric: 'Value score' }, { name: 'Denominator Reduction', objective: 'Reduce effort', instructions: 'Find one way to make your offer easier to consume.', frequency: 'Weekly', successMetric: 'Effort score' }] },
  // ... add 19 more
];

async function seed() {
  await setDoc(doc(db, 'books', '100m-offers'), { title: '$100M Offers', author: 'Alex Hormozi' });
  for (const insight of insights) {
    await setDoc(doc(db, 'books', '100m-offers', 'insights', insight.id), insight);
  }
  console.log('Seeded!');
}

seed();
