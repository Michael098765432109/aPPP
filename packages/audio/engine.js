/**
 * Motor de audio generativo.
 * No usa archivos: sintetiza pads, lluvia y reverb en vivo con Web Audio.
 * Debe arrancarse tras un gesto del usuario (play / botón de sonido).
 */

export const MOODS = [
  { id: "amanecer", label: "Amanecer", hint: "Luz que entra despacio" },
  { id: "lluvia", label: "Lluvia", hint: "Ruido que calma" },
  { id: "estrellas", label: "Estrellas", hint: "Noche abierta" }
];

const PRESETS = {
  amanecer: {
    root: 110,
    chords: [
      [0, 7, 12, 16],
      [-3, 4, 12, 19],
      [-5, 7, 14, 19],
      [0, 7, 12, 16]
    ],
    cutoff: 1450,
    interval: 15000,
    rain: 0,
    type: "triangle",
    detune: 5
  },
  lluvia: {
    root: 98,
    chords: [
      [0, 3, 10, 15],
      [-2, 3, 10, 14],
      [-4, 3, 8, 12],
      [0, 3, 10, 15]
    ],
    cutoff: 820,
    interval: 17000,
    rain: 0.95,
    type: "sine",
    detune: 6
  },
  estrellas: {
    root: 87.31,
    chords: [
      [0, 7, 12, 14],
      [0, 5, 12, 19],
      [-5, 7, 12, 17],
      [0, 7, 12, 14]
    ],
    cutoff: 1150,
    interval: 19000,
    rain: 0,
    type: "sine",
    detune: 3
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.initPromise = null;
    this.playing = false;
    this.mood = "amanecer";
    this.chordIndex = 0;
    this.volume = 0.55;
    this.timer = null;
    this.rain = null;
    this.analyser = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw new Error("Web Audio no disponible");
      const ctx = new AudioCtx();
      this.ctx = ctx;

      this.master = ctx.createGain();
      this.master.gain.value = 0;

      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.86;

      this.master.connect(this.analyser);
      this.analyser.connect(ctx.destination);

      this.filter = ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = PRESETS[this.mood].cutoff;
      this.filter.Q.value = 0.35;

      this.dry = ctx.createGain();
      this.dry.gain.value = 0.72;
      this.filter.connect(this.dry).connect(this.master);

      this.convolver = ctx.createConvolver();
      this.convolver.buffer = this.makeImpulse(3.4, 2.6);
      this.wet = ctx.createGain();
      this.wet.gain.value = 0.5;
      this.filter.connect(this.convolver);
      this.convolver.connect(this.wet).connect(this.master);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 240;
      lfo.connect(lfoGain).connect(this.filter.frequency);
      lfo.start();

      this.createRain();
      this.applyMood(this.mood, true);
    })();

    return this.initPromise;
  }

  makeImpulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        const envelope = Math.pow(1 - i / length, decay);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
    return buffer;
  }

  createRain() {
    const ctx = this.ctx;
    const length = Math.floor(ctx.sampleRate * 4);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;

    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = 0.97 * last + 0.03 * white;
      data[i] = last * 2.2;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 480;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3200;

    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;

    source.connect(highpass).connect(lowpass).connect(this.rainGain).connect(this.master);
    source.start();
    this.rain = source;
  }

  async start() {
    await this.init();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    if (this.playing) return;

    this.playing = true;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
    this.master.gain.linearRampToValueAtTime(this.volume, now + 1.4);

    this.playChord();
    this.restartTimer();
  }

  stop() {
    if (!this.ctx) return;
    this.playing = false;
    clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
    this.master.gain.linearRampToValueAtTime(0.0001, now + 0.9);
  }

  async toggle() {
    if (this.playing) {
      this.stop();
      return false;
    }
    await this.start();
    return true;
  }

  restartTimer() {
    clearInterval(this.timer);
    if (!this.playing) return;
    const { interval } = PRESETS[this.mood];
    this.timer = setInterval(() => this.playChord(), interval);
  }

  playChord() {
    if (!this.ctx || !this.playing) return;
    const ctx = this.ctx;
    const preset = PRESETS[this.mood];
    const chord = preset.chords[this.chordIndex % preset.chords.length];
    this.chordIndex += 1;

    const now = ctx.currentTime;
    const duration = preset.interval / 1000 + 3;
    const voice = ctx.createGain();
    voice.gain.value = 0.0001;
    voice.connect(this.filter);

    const noteGain = 0.22 / chord.length;

    chord.forEach((semitone) => {
      const frequency = preset.root * Math.pow(2, semitone / 12);
      [-preset.detune, preset.detune].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = preset.type;
        osc.frequency.value = frequency;
        osc.detune.value = detune;

        const gain = ctx.createGain();
        gain.gain.value = noteGain;

        osc.connect(gain).connect(voice);
        osc.start(now);
        osc.stop(now + duration + 0.5);
        osc.onended = () => osc.disconnect();
      });
    });

    const hold = Math.max(duration - 4.5, 4);
    voice.gain.exponentialRampToValueAtTime(0.85, now + 3.2);
    voice.gain.setValueAtTime(0.85, now + hold);
    voice.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    setTimeout(() => voice.disconnect(), (duration + 1) * 1000);
  }

  setVolume(value) {
    this.volume = clamp(value, 0, 1);
    if (!this.ctx || !this.playing) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
    this.master.gain.linearRampToValueAtTime(this.volume, now + 0.2);
  }

  setMood(mood) {
    if (!PRESETS[mood] || mood === this.mood) return;
    this.mood = mood;
    this.chordIndex = 0;
    if (!this.ctx) return;
    this.applyMood(mood, false);
    this.restartTimer();
  }

  applyMood(mood, immediate) {
    if (!this.ctx) return;
    const preset = PRESETS[mood];
    const now = this.ctx.currentTime;
    const fade = immediate ? 0.01 : 1.6;

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(preset.cutoff, now + fade);

    if (this.rainGain) {
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, now);
      this.rainGain.gain.linearRampToValueAtTime(preset.rain * 0.11, now + fade);
    }
  }

  getAnalyser() {
    return this.analyser;
  }
}
