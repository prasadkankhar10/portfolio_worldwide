import { useGameStore } from '../store/useGameStore';

/**
 * Procedural Web Audio Sound Engine
 * Zero external audio files: 100% synthesized in real time via Web Audio API.
 * High performance, zero bandwidth cost, perfectly timed micro-interactions.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbienceRunning = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isMuted(): boolean {
    return useGameStore.getState().isAudioMuted;
  }

  /**
   * Subtle wooden UI tap for button interactions
   */
  public playClickSound() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio autoplay restrictions safeguard
    }
  }

  /**
   * Crystal chime when setting or tracking an in-world GPS waypoint
   */
  public playWaypointTrackSound() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [784, 1046.5]; // G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch {}
  }

  /**
   * Harmonic triad chime when stepping into an exhibit's trigger ring
   */
  public playStationDiscoverSound() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.09, now + i * 0.05 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.6);
      });
    } catch {}
  }

  /**
   * Atmospheric whoosh filter sweep for fast-travel teleportation
   */
  public playTeleportSound() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.5;
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.55);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.65);
    } catch {}
  }

  /**
   * Uplifting celebratory fanfare for unlocking milestone badges
   */
  public playBadgeFanfareSound() {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const fanfare = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === fanfare.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + (idx === fanfare.length - 1 ? 0.9 : 0.4));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.0);
      });
    } catch {}
  }

  /**
   * Start soft procedural ambient ocean & breeze wash in background
   */
  public startAmbientAtmosphere() {
    if (this.isAmbienceRunning || this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.15; // Pink noise
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Gentle 8-second wave swells
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(160, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 3.0); // Gentle fade-in

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      lfo.start();

      this.ambientSource = noise;
      this.ambientGain = gain;
      this.isAmbienceRunning = true;
    } catch {}
  }

  /**
   * Procedural material-aware footstep audio
   */
  public playFootstep(surface: 'wood' | 'grass' | 'stone' = 'grass') {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (surface === 'wood') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (surface === 'stone') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(240 + Math.random() * 30, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else {
        // grass / dirt
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110 + Math.random() * 25, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // --- Procedural Harbor Jukebox ---
  private jukeboxInterval: number | null = null;
  private currentTrack: string | null = null;

  public playJukeboxTrack(track: 'celestial' | 'journey' | 'lofi') {
    this.stopJukebox();
    if (this.isMuted()) return;
    this.currentTrack = track;

    const ctx = this.getContext();
    if (!ctx) return;

    const scales: Record<string, number[]> = {
      celestial: [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50], // Pentatonic Major
      journey: [261.63, 329.63, 392.00, 440.00, 523.25], // Acoustic Lute
      lofi: [220.00, 261.63, 293.66, 329.63, 392.00] // A minor chill
    };

    const notes = scales[track] || scales.celestial;
    let step = 0;

    const tick = () => {
      if (this.isMuted() || this.currentTrack !== track) return;
      const c = this.getContext();
      if (!c) return;

      try {
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();

        const freq = notes[step % notes.length];
        step = (step + 1 + Math.floor(Math.random() * 2)) % notes.length;

        osc.type = track === 'lofi' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(track === 'lofi' ? 0.025 : 0.04, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (track === 'lofi' ? 1.4 : 0.8));

        osc.connect(gain);
        gain.connect(c.destination);

        osc.start(now);
        osc.stop(now + (track === 'lofi' ? 1.5 : 0.9));
      } catch {}
    };

    // Play immediate first note
    tick();
    const intervalTime = track === 'lofi' ? 1200 : 750;
    this.jukeboxInterval = window.setInterval(tick, intervalTime);
  }

  public stopJukebox() {
    if (this.jukeboxInterval !== null) {
      clearInterval(this.jukeboxInterval);
      this.jukeboxInterval = null;
    }
    this.currentTrack = null;
  }

  /**
   * Stop ambient sound
   */
  public stopAmbientAtmosphere() {
    if (!this.isAmbienceRunning || !this.ambientGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        if (this.ambientSource) {
          try { (this.ambientSource as AudioBufferSourceNode).stop(); } catch {}
          this.ambientSource.disconnect();
          this.ambientSource = null;
        }
        this.isAmbienceRunning = false;
      }, 900);
    } catch {
      this.isAmbienceRunning = false;
    }
  }
}

export const soundEngine = new SoundEngine();
