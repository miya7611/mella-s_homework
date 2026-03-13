// Sound service for audio notifications
// Uses Web Audio API for better control

type SoundType = 'start' | 'complete' | 'timeout' | 'tick' | 'levelUp';

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Load settings from localStorage
    const savedEnabled = localStorage.getItem('soundEnabled');
    const savedVolume = localStorage.getItem('soundVolume');
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', String(enabled));
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', String(this.volume));
  }

  getEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // Play a beep sound with specific frequency and duration
  private playBeep(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // Envelope for smoother sound
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  // Play multiple beeps in sequence
  private playSequence(notes: { freq: number; duration: number; delay: number }[]) {
    if (!this.enabled) return;

    notes.forEach(note => {
      setTimeout(() => {
        this.playBeep(note.freq, note.duration);
      }, note.delay);
    });
  }

  // Timer start sound - short ascending beep
  playStart() {
    if (!this.enabled) return;
    this.playSequence([
      { freq: 440, duration: 0.1, delay: 0 },
      { freq: 550, duration: 0.1, delay: 100 },
      { freq: 660, duration: 0.15, delay: 200 },
    ]);
  }

  // Timer complete sound - pleasant melody
  playComplete() {
    if (!this.enabled) return;
    this.playSequence([
      { freq: 523, duration: 0.15, delay: 0 },    // C5
      { freq: 659, duration: 0.15, delay: 150 },  // E5
      { freq: 784, duration: 0.2, delay: 300 },   // G5
      { freq: 1047, duration: 0.3, delay: 500 },  // C6
    ]);
  }

  // Timeout warning sound - urgent beeps
  playTimeout() {
    if (!this.enabled) return;
    this.playSequence([
      { freq: 880, duration: 0.1, delay: 0 },
      { freq: 880, duration: 0.1, delay: 150 },
      { freq: 880, duration: 0.1, delay: 300 },
      { freq: 660, duration: 0.2, delay: 450 },
    ]);
  }

  // Tick sound - soft click
  playTick() {
    if (!this.enabled) return;
    this.playBeep(1000, 0.02, 'square');
  }

  // Level up sound - triumphant melody
  playLevelUp() {
    if (!this.enabled) return;
    this.playSequence([
      { freq: 523, duration: 0.1, delay: 0 },     // C5
      { freq: 659, duration: 0.1, delay: 100 },   // E5
      { freq: 784, duration: 0.1, delay: 200 },   // G5
      { freq: 1047, duration: 0.1, delay: 300 },  // C6
      { freq: 784, duration: 0.1, delay: 400 },   // G5
      { freq: 1047, duration: 0.3, delay: 500 },  // C6
    ]);
  }

  // Play sound by type
  play(type: SoundType) {
    switch (type) {
      case 'start':
        this.playStart();
        break;
      case 'complete':
        this.playComplete();
        break;
      case 'timeout':
        this.playTimeout();
        break;
      case 'tick':
        this.playTick();
        break;
      case 'levelUp':
        this.playLevelUp();
        break;
    }
  }

  // Resume audio context (needed after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const soundService = new SoundService();
