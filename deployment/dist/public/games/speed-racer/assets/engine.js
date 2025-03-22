// Audio engine sound for Speed Racer
// This can be imported into the main game.js file if needed

class EngineSound {
  constructor() {
    this.audioContext = null;
    this.engineNode = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator for engine sound
      this.engineNode = this.audioContext.createOscillator();
      this.engineNode.type = 'sawtooth';
      this.engineNode.frequency.value = 50; // Base engine frequency
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.1; // Default volume
      
      // Connect nodes
      this.engineNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  start() {
    if (!this.audioContext || this.isPlaying) return;
    
    this.engineNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.engineNode.stop();
    this.isPlaying = false;
    
    // Need to recreate nodes after stopping
    this.engineNode = this.audioContext.createOscillator();
    this.engineNode.type = 'sawtooth';
    this.engineNode.frequency.value = 50;
    this.engineNode.connect(this.gainNode);
  }

  // Update engine sound based on speed
  updateSpeed(speed) {
    if (!this.isPlaying) return;
    
    // Map speed to frequency range (50Hz - 100Hz)
    const maxSpeed = 300;
    const minFreq = 50;
    const maxFreq = 100;
    const speedRatio = Math.min(speed / maxSpeed, 1);
    const frequency = minFreq + speedRatio * (maxFreq - minFreq);
    
    // Smoothly change frequency
    this.engineNode.frequency.exponentialRampToValueAtTime(
      frequency,
      this.audioContext.currentTime + 0.1
    );
    
    // Adjust volume based on speed
    this.gainNode.gain.exponentialRampToValueAtTime(
      0.05 + speedRatio * 0.15,
      this.audioContext.currentTime + 0.1
    );
  }
}

// Export for use in main game
window.EngineSound = EngineSound;