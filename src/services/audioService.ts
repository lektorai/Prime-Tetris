
class AudioService {
  private audioContext: AudioContext | null = null;
  private gameMusic: HTMLAudioElement | null = null;
  private menuMusic: HTMLAudioElement | null = null;
  private currentMusic: HTMLAudioElement | null = null;
  private volume: number = 0.5;
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private masterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('prime-tetris-volume');
      const savedSound = localStorage.getItem('prime-tetris-sound');
      const savedMusic = localStorage.getItem('prime-tetris-music-on');
      
      this.volume = savedVolume ? parseFloat(savedVolume) : 0.1;
      this.isSoundEnabled = savedSound !== 'false';
      this.isMusicEnabled = savedMusic !== 'false';
      
      // Gameplay music
      this.gameMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'); 
      this.gameMusic.loop = true;
      this.gameMusic.volume = this.volume;

      // Menu/Game Over music
      this.menuMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
      this.menuMusic.loop = true;
      this.menuMusic.volume = this.volume;

      this.currentMusic = this.menuMusic;
    }
  }

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gain = 0.2) {
    if (!this.isSoundEnabled || this.volume <= 0) return;
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const g = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    g.gain.setValueAtTime(gain, this.audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    osc.connect(g);
    g.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playRotate() {
    this.playTone(400, 'square', 0.1, 0.02);
  }

  playLand() {
    // Left empty as per user request
  }

  playLineClear() {
    this.playTone(1000, 'sine', 0.3, 0.2);
    setTimeout(() => this.playTone(1200, 'sine', 0.3, 0.1), 50);
  }

  playGameOver() {
    this.switchMusic(this.menuMusic);
    const notes = [
      { f: 300, t: 0 },
      { f: 250, t: 0.2 },
      { f: 200, t: 0.4 },
      { f: 150, t: 0.6 }
    ];
    notes.forEach(n => {
      setTimeout(() => this.playTone(n.f, 'sawtooth', 0.8, 0.15), n.t * 1000);
    });
  }

  playVictory() {
    this.switchMusic(this.menuMusic);
    [523, 659, 783, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.4, 0.2), i * 150);
    });
  }

  private switchMusic(nextMusic: HTMLAudioElement | null) {
    if (!this.isMusicEnabled) {
      if (this.currentMusic) this.currentMusic.pause();
      this.currentMusic = nextMusic;
      return;
    }

    if (!nextMusic) {
      if (this.currentMusic) this.currentMusic.pause();
      return;
    }

    if (this.currentMusic === nextMusic && !this.currentMusic.paused) return;

    if (this.currentMusic) {
      this.currentMusic.pause();
    }
    
    this.currentMusic = nextMusic;
    this.currentMusic.volume = this.volume;
    
    const playPromise = this.currentMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Ignored
      });
    }
  }

  setVolume(v: number) {
    this.volume = v;
    localStorage.setItem('prime-tetris-volume', v.toString());
    if (this.masterGain) this.masterGain.gain.value = v;
    if (this.gameMusic) this.gameMusic.volume = v;
    if (this.menuMusic) this.menuMusic.volume = v;
  }

  toggleSound(on: boolean) {
    this.isSoundEnabled = on;
    localStorage.setItem('prime-tetris-sound', on.toString());
  }

  toggleMusic(on: boolean) {
    this.isMusicEnabled = on;
    localStorage.setItem('prime-tetris-music-on', on.toString());
    if (on) {
      this.initAudio();
      if (this.currentMusic) {
        this.currentMusic.play().catch(() => {});
      }
    } else {
      if (this.currentMusic) {
        this.currentMusic.pause();
      }
    }
  }

  startMusic() {
    this.initAudio();
    this.switchMusic(this.gameMusic);
  }

  startMenuMusic() {
    this.initAudio();
    this.switchMusic(this.menuMusic);
  }

  getSettings() {
    return {
      volume: this.volume,
      sound: this.isSoundEnabled,
      music: this.isMusicEnabled
    };
  }
}

export const audioService = new AudioService();
