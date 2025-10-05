import { useCallback, useRef } from 'react';

interface SoundEffects {
  playSpray: () => void;
  playSiren: () => void;
  playSuccess: () => void;
  playBusted: () => void;
  playAmbient: () => void;
  stopAmbient: () => void;
  playClick: () => void;
}

export const useSoundEffects = (): SoundEffects => {
  const audioContext = useRef<AudioContext | null>(null);
  const ambientOscillator = useRef<OscillatorNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  const playSpray = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'white' as any; // Näherung für Spray-Sound
    oscillator.frequency.setValueAtTime(8000, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  }, [getAudioContext]);

  const playSiren = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 1);
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime + i * 0.1);
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  }, [getAudioContext]);

  const playBusted = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  }, [getAudioContext]);

  const playAmbient = useCallback(() => {
    const ctx = getAudioContext();
    if (ambientOscillator.current) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    ambientOscillator.current = oscillator;
  }, [getAudioContext]);

  const stopAmbient = useCallback(() => {
    if (ambientOscillator.current) {
      ambientOscillator.current.stop();
      ambientOscillator.current = null;
    }
  }, []);

  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  return {
    playSpray,
    playSiren,
    playSuccess,
    playBusted,
    playAmbient,
    stopAmbient,
    playClick,
  };
};
