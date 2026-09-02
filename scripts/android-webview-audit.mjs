import WebSocket from 'ws';

const mode = process.argv[2] || 'text';
const targets = await fetch('http://127.0.0.1:9222/json').then((response) => response.json());
const target = targets.find((entry) => entry.type === 'page');

if (!target?.webSocketDebuggerUrl) {
  throw new Error('No Android WebView debugging target is available on port 9222.');
}

const expressions = {
  seed: `
    localStorage.setItem('t1ger_onboarding_completed', 'true');
    localStorage.setItem('t1ger_local_app_user', JSON.stringify({
      uid: 'android-audit',
      email: '',
      displayName: 'Audit User',
      role: 'member',
      level: 1,
      xp: 0,
      streak: 0,
      coins: 0,
      isPro: false,
      onboardingComplete: true,
      primaryTrack: 'investing',
      learningStyle: 'interactive'
    }));
    location.reload();
    'seeded';
  `,
  text: `document.body.innerText`,
};

if (!expressions[mode]) {
  throw new Error(`Unknown mode "${mode}". Use "seed" or "text".`);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const response = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('WebView audit timed out.')), 10_000);

  socket.on('open', () => {
    socket.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: expressions[mode], returnByValue: true },
    }));
  });
  socket.on('message', (message) => {
    const payload = JSON.parse(message.toString());
    if (payload.id !== 1) return;
    clearTimeout(timeout);
    resolve(payload);
    socket.close();
  });
  socket.on('error', reject);
});

if (response.error || response.result?.exceptionDetails) {
  throw new Error(JSON.stringify(response.error || response.result.exceptionDetails));
}

console.log(response.result?.result?.value ?? 'ok');
