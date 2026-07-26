import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

export const fireRewardConfetti = () => {
  const scalar = 2;
  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.96,
    startVelocity: 20,
    shapes: ['star'] as confetti.Shape[],
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
  };

  const shoot = () => {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: scalar / 2,
      shapes: ['circle'] as confetti.Shape[]
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: scalar
    });
  };

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};
