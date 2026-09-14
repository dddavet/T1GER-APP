/**
 * Procedural Synthetic Web Audio Engine for T1GER APP
 * 100% Client-side synthesized - High fidelity, Zero latency, 0 KB external downloads.
 * Powers the multi-sensory delight loops found in top-tier apps like Duolingo & Kinnu.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Device haptic vibration helper with progressive enhancement.
   */
  public triggerHaptic(pattern: number | number[] = 10) {
    if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch {
        // Haptic is progressive enhancement
      }
    }
  }

  /**
   * Satisfying, punchy mechanical switch tap (Nintendo Switch / Apple iOS haptic feel).
   * Dual-layer: low mechanical body thud + high crisp impulse click.
   */
  public playTap() {
    this.triggerHaptic(8);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Layer 1: Crisp click impulse (1800Hz -> 500Hz)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(500, now + 0.012);

      clickGain.gain.setValueAtTime(0.045, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.016);

      // Layer 2: Mechanical thud / body (180Hz -> 50Hz)
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(180, now);
      thudOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

      thudGain.gain.setValueAtTime(0.05, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.04);
    } catch {
      // Audio is progressive enhancement
    }
  }

  /**
   * Juicy rubbery popping sound for pressing Duolingo orbs / milestone nodes.
   * Sweeps smoothly upward with resonance, giving an organic tactile bubble pop.
   */
  public playOrbPress() {
    this.triggerHaptic(12);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.045);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio is progressive enhancement
    }
  }

  /**
   * Micro toggle click for switching tabs, filters, or views.
   */
  public playToggle() {
    this.triggerHaptic(6);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Progressive enhancement
    }
  }

  /**
   * Ascending C-Major chord arpeggio for correct quiz answers.
   * Stimulates the dopamine reward loop (Duolingo signature delight).
   */
  public playCorrect() {
    this.triggerHaptic([15, 30, 45]);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // C5, E5, G5, C6 arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Richer, warm harmonics
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.065, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.21);
      });
    } catch {
      // Progressive enhancement
    }
  }

  /**
   * Gentle, warm wooden marimba thud for incorrect answers.
   * Non-punitive, supportive, and informative.
   */
  public playIncorrect() {
    this.triggerHaptic([35, 25, 45]);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(105, now + 0.16);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Progressive enhancement
    }
  }

  /**
   * Grand triumph fanfare when completing a lesson or real-world field mission.
   * C-Major triad swell followed by sparkling high coin chimes.
   */
  public playCompletionFanfare() {
    this.triggerHaptic([20, 40, 20, 60, 100]);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Chord swell: G4, C5, E5, G5
      const chord = [392.0, 523.25, 659.25, 783.99];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.46);
      });

      // Sparkling high chime at +0.25s: B5 -> E6
      const chimes = [987.77, 1318.51, 1567.98];
      chimes.forEach((freq, idx) => {
        const chimeTime = now + 0.22 + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chimeTime);

        gain.gain.setValueAtTime(0.06, chimeTime);
        gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chimeTime);
        osc.stop(chimeTime + 0.29);
      });
    } catch {
      // Progressive enhancement
    }
  }

  /**
   * Warm whoosh for streak activation and milestone unlocks.
   */
  public playStreakFlame() {
    this.triggerHaptic([15, 25, 35]);
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.25);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.27);
    } catch {
      // Progressive enhancement
    }
  }
}

export const SoundEffects = new SoundEffectsEngine();
