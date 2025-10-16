/**
 * Haptic Feedback System
 * Provides tactile feedback for mobile devices
 * Silicon Valley Standard - Enhance UX with subtle vibrations
 */

export type HapticPattern =
  | 'light'      // Subtle tap (10ms)
  | 'medium'     // Standard tap (20ms)
  | 'heavy'      // Strong tap (50ms)
  | 'success'    // Success pattern
  | 'warning'    // Warning pattern
  | 'error'      // Error pattern
  | 'selection'; // Selection tap

interface HapticConfig {
  duration: number;
  pattern?: number[];
}

const HAPTIC_PATTERNS: Record<HapticPattern, HapticConfig> = {
  light: { duration: 10 },
  medium: { duration: 20 },
  heavy: { duration: 50 },
  success: { pattern: [20, 50, 20] },
  warning: { pattern: [30, 30, 30] },
  error: { pattern: [50, 100, 50, 100, 50] },
  selection: { duration: 15 },
};

class HapticFeedbackManager {
  private isSupported = false;
  private isEnabled = true;

  constructor() {
    this.checkSupport();
  }

  private checkSupport() {
    // Check for Vibration API
    if ('vibrate' in navigator) {
      this.isSupported = true;
    }

    // Check for iOS Taptic Engine (WebKit)
    if (window.navigator && 'vibrate' in window.navigator) {
      this.isSupported = true;
    }
  }

  public isHapticsSupported(): boolean {
    return this.isSupported;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('haptics-enabled', enabled.toString());
  }

  public getEnabled(): boolean {
    const stored = localStorage.getItem('haptics-enabled');
    return stored !== null ? stored === 'true' : true;
  }

  public trigger(pattern: HapticPattern = 'light') {
    if (!this.isSupported || !this.isEnabled) return;

    const config = HAPTIC_PATTERNS[pattern];

    try {
      if (config.pattern) {
        navigator.vibrate(config.pattern);
      } else {
        navigator.vibrate(config.duration);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Convenience methods
  public light() {
    this.trigger('light');
  }

  public medium() {
    this.trigger('medium');
  }

  public heavy() {
    this.trigger('heavy');
  }

  public success() {
    this.trigger('success');
  }

  public warning() {
    this.trigger('warning');
  }

  public error() {
    this.trigger('error');
  }

  public selection() {
    this.trigger('selection');
  }
}

// Singleton instance
export const haptics = new HapticFeedbackManager();

// React hook for haptic feedback
export const useHaptics = () => {
  return {
    trigger: (pattern: HapticPattern = 'light') => haptics.trigger(pattern),
    light: () => haptics.light(),
    medium: () => haptics.medium(),
    heavy: () => haptics.heavy(),
    success: () => haptics.success(),
    warning: () => haptics.warning(),
    error: () => haptics.error(),
    selection: () => haptics.selection(),
    isSupported: haptics.isHapticsSupported(),
    enabled: haptics.getEnabled(),
    setEnabled: (enabled: boolean) => haptics.setEnabled(enabled),
  };
};

export default haptics;
