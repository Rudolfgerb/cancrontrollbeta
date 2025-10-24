import { GAME_CONSTANTS } from '../config/constants.js';
import Player from '../models/Player.js';
import Spot from '../models/Spot.js';
import Graffiti from '../models/Graffiti.js';
import streetViewService from './streetview.service.js';

class GameService {
  /**
   * Calculate stealth drain rate based on spot and modifiers
   */
  calculateStealthDrainRate(spot, activeModifiers = []) {
    let drainRate = GAME_CONSTANTS.STEALTH.DEFAULT_DRAIN_RATE;

    // Apply risk factor
    drainRate *= spot.riskFactor;

    // Apply time-based multiplier
    const currentHour = new Date().getHours();
    const timeFactor = this.getTimeFactor(currentHour);
    drainRate *= timeFactor;

    // Apply active modifiers
    activeModifiers.forEach(modifier => {
      drainRate *= modifier.multiplier;
    });

    return drainRate;
  }

  /**
   * Get time-based risk factor
   */
  getTimeFactor(hour) {
    if (hour >= 6 && hour <= 18) return 1.3; // Day - higher risk
    if (hour >= 19 && hour <= 21) return 1.0; // Evening - medium risk
    return 0.7; // Night - lower risk
  }

  /**
   * Generate random risk event
   */
  generateRiskEvent() {
    const events = Object.keys(GAME_CONSTANTS.RISK_EVENTS);
    const probabilities = {
      PEDESTRIAN: 0.4,
      CAR_PASSING: 0.3,
      POLICE_PATROL: 0.1,
      GOOD_COVER: 0.15,
      NIGHT_FALL: 0.05,
    };

    const random = Math.random();
    let cumulative = 0;

    for (const [eventName, probability] of Object.entries(probabilities)) {
      cumulative += probability;
      if (random <= cumulative) {
        const eventData = GAME_CONSTANTS.RISK_EVENTS[eventName];
        return {
          type: eventName,
          ...eventData,
          timestamp: new Date(),
        };
      }
    }

    return null;
  }

  /**
   * Calculate fine amount for arrest
   */
  calculateFine(spot, arrestCount) {
    const baseFine = GAME_CONSTANTS.POLICE.BASE_FINE;
    const riskMultiplier = spot.riskFactor;
    const arrestMultiplier = Math.pow(1.5, arrestCount);

    return Math.floor(baseFine * riskMultiplier * arrestMultiplier);
  }

  /**
   * Process arrest
   */
  async processArrest(playerId, spotId) {
    try {
      const player = await Player.findById(playerId);
      const spot = await Spot.findById(spotId);

      if (!player || !spot) {
        throw new Error('Player or Spot not found');
      }

      // Calculate fine
      const arrestCount = player.stats.timesArrested;
      const fine = this.calculateFine(spot, arrestCount);

      // Deduct money and reputation
      try {
        player.deductMoney(fine);
      } catch (error) {
        // If not enough money, take what they have
        player.money = 0;
      }

      player.deductReputation(GAME_CONSTANTS.REPUTATION.ARREST_PENALTY);
      player.stats.timesArrested += 1;

      // Add to arrest history
      player.arrestHistory.push({
        spotId: spot.spotId,
        fineAmount: fine,
        location: spot.location,
      });

      // Check if should be jailed
      const recentArrests = this.getRecentArrests(player.arrestHistory, 24);
      const shouldJail = recentArrests >= GAME_CONSTANTS.POLICE.ARREST_THRESHOLD;

      if (shouldJail) {
        const jailHours = GAME_CONSTANTS.JAIL.BASE_TIME_HOURS;
        player.jailStatus = {
          isInJail: true,
          releaseTime: new Date(Date.now() + jailHours * 60 * 60 * 1000),
          reason: 'Multiple arrests',
        };
      }

      await player.save();

      return {
        success: true,
        fine,
        jailed: shouldJail,
        remainingMoney: player.money,
        reputation: player.reputation,
      };
    } catch (error) {
      console.error('Error processing arrest:', error);
      throw error;
    }
  }

  /**
   * Get recent arrests count within hours
   */
  getRecentArrests(arrestHistory, hours) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return arrestHistory.filter(arrest => arrest.timestamp >= cutoffTime).length;
  }

  /**
   * Process successful escape
   */
  async processEscape(playerId) {
    try {
      const player = await Player.findById(playerId);
      if (!player) throw new Error('Player not found');

      player.addReputation(GAME_CONSTANTS.REPUTATION.ESCAPE_REWARD);
      player.stats.successfulEscapes += 1;

      await player.save();

      return {
        success: true,
        reputation: player.reputation,
      };
    } catch (error) {
      console.error('Error processing escape:', error);
      throw error;
    }
  }

  /**
   * Calculate graffiti score
   */
  calculateGraffitiScore(graffiti, spot, escaped) {
    let score = 0;

    // Base score from complexity
    score += graffiti.stats.complexity || 0;

    // Risk bonus
    score += spot.riskFactor * 100;

    // Escape bonus
    if (escaped) {
      score += 200;
    }

    // Duration bonus (up to 5 minutes)
    const durationBonus = Math.min(graffiti.paintingSession.duration / 10, 30);
    score += durationBonus;

    return Math.floor(score);
  }

  /**
   * Complete painting session
   */
  async completePaintingSession(graffitiId, wasSuccessful, escaped) {
    try {
      const graffiti = await Graffiti.findOne({ graffitiId });
      if (!graffiti) throw new Error('Graffiti not found');

      const spot = await Spot.findById(graffiti.spotId);
      const player = await Player.findById(graffiti.playerId);

      if (!spot || !player) throw new Error('Spot or Player not found');

      if (wasSuccessful) {
        // Mark as complete
        graffiti.isPainted = true;
        graffiti.completedAt = new Date();
        graffiti.paintingSession.escapedPolice = escaped;

        // Calculate score
        const score = this.calculateGraffitiScore(graffiti, spot, escaped);
        graffiti.stats.score = score;

        // Update spot
        spot.currentGraffiti = graffiti._id;
        spot.owningPlayerId = player._id;
        spot.lastPainted = new Date();
        spot.paintCount += 1;

        // Update player
        player.stats.totalGraffitis += 1;
        player.addReputation(GAME_CONSTANTS.REPUTATION.PIECE_BASE_REWARD);
        player.experience += score;
        player.calculateLevel();

        await graffiti.save();
        await spot.save();
        await player.save();

        return {
          success: true,
          graffiti,
          score,
          reputation: player.reputation,
          level: player.level,
        };
      } else {
        // Failed session
        return {
          success: false,
          message: 'Painting session failed',
        };
      }
    } catch (error) {
      console.error('Error completing painting session:', error);
      throw error;
    }
  }
}

export default new GameService();
