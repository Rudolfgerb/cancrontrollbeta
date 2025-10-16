import { achievements, Achievement, AchievementRequirement } from '@/data/achievements';

export interface UserAchievement {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
}

export interface UserStats {
  // Beginner metrics
  lines_drawn: number;
  pieces_completed: number;
  fame: number;
  spots_painted: number;
  colors_bought: number;
  sprays_used: number;
  night_piece: boolean;
  total_money_earned: number;
  best_quality: number;
  tools_bought: number;
  tags_completed: number;
  escapes: number;
  joined_crew: boolean;
  hidden_spots_found: number;
  throwups_completed: number;
  current_money: number;
  fastest_piece: number;
  colors_owned: number;
  consecutive_days: number;
  reputation: number;
  clean_spots: number;
  tools_owned: number;

  // Train metrics
  trains_painted: number;
  subway_trains: number;
  whole_cars: number;
  end_to_end: number;
  top_to_bottom: number;
  unique_trains: number;
  night_train: boolean;
  yard_trains: number;
  all_metro_lines: boolean;
  moving_trains: number;
  freight_trains: number;
  fastest_train: number;
  panels_painted: number;
  train_characters: number;
  clean_trains: number;
  crew_trains: number;
  commuter_trains: number;
  international_trains: number;
  colors_on_train: number;
  train_takeovers: number;
  stealth_trains: number;
  best_train_quality: number;
  sunrise_train: boolean;
  unique_stations: number;
  trains_one_day: number;
  rush_hour_train: boolean;
  vintage_trains: number;
  layup_trains: number;
  cities_trains: number;
  double_decker_trains: number;
  train_signatures: number;
  depot_trains: number;
  unique_train_types: number;

  // Art metrics
  wildstyle_pieces: number;
  character_pieces: number;
  unique_styles: number;
  colors_used: number;
  '3d_pieces': number;
  bubble_pieces: number;
  masterpiece_pieces: number;
  abstract_pieces: number;
  portrait_pieces: number;
  max_elements: number;
  harmonic_pieces: number;
  stencils_used: number;
  precision_pieces: number;
  complex_backgrounds: number;
  details_added: number;
  perfect_outlines: number;
  fill_techniques: number;
  shadow_pieces: number;
  glow_pieces: number;
  perfect_letters: number;
  connected_pieces: number;
  gradient_pieces: number;
  dimension_pieces: number;
  symmetric_pieces: number;
  detailed_backgrounds: number;
  arrow_pieces: number;
  highlight_pieces: number;
  forcefield_pieces: number;
  chrome_pieces: number;
  drip_pieces: number;
  style_evolution: number;
  techniques_combined: number;
  consistent_quality: number;
  quality_pieces: number;
  colors_in_piece: number;

  // Stealth metrics
  stealth_pieces: number;
  guard_stealth: number;
  night_stealth: number;
  fastest_escape: number;
  no_wanted: number;
  crowd_hides: number;
  rooftop_escapes: number;
  silent_pieces: number;
  cameras_avoided: number;
  three_star_escape: number;
  parkour_escapes: number;
  disguises_used: number;
  guards_distracted: number;
  hideouts_used: number;
  sewer_escapes: number;
  zero_wanted_pieces: number;
  locks_picked: number;
  timing_pieces: number;
  alarms_disabled: number;
  shadow_movements: number;
  smoke_escapes: number;
  vehicle_escapes: number;
  building_jumps: number;
  never_caught: number;
  day_stealth: number;
  escape_methods: number;
  close_escapes: number;
  perfect_stealth: number;

  // Location metrics
  unique_districts: number;
  all_metro_stations: boolean;
  high_buildings: number;
  unique_bridges: number;
  tunnels_painted: number;
  abandoned_buildings: number;
  parks_painted: number;
  industrial_pieces: number;
  waterfront_spots: number;
  rooftops_painted: number;
  basement_pieces: number;
  school_pieces: number;
  stadium_pieces: number;
  main_street_pieces: number;
  alley_pieces: number;
  parking_pieces: number;
  church_pieces: number;
  office_pieces: number;
  market_pieces: number;
  mall_pieces: number;
  hospital_pieces: number;
  airport_pieces: number;
  harbor_pieces: number;
  university_pieces: number;
  museum_pieces: number;
  secret_spots: number;
  all_districts: boolean;
  tourist_pieces: number;
  residential_pieces: number;
  construction_pieces: number;
  all_landmarks: boolean;
  unique_locations: number;
  forbidden_pieces: number;
  unique_cities: number;

  // Prestige metrics
  total_pieces: number;
  average_quality: number;
  crew_top_rank: boolean;
  quality_streak: number;
  speed_pieces: number;
  night_pieces: number;
  unique_spots: number;
  all_colors: boolean;
  all_tools: boolean;
  play_time: number;
  achievements_unlocked: number;
  total_likes: number;
  max_views: number;
  top_10_leaderboard: boolean;
  world_rank_1: boolean;
  all_achievements: boolean;

  // Speed metrics
  pieces_10min: number;
  fast_pieces: number;
  sprint_tags: number;
  fast_throwups: number;
  express_pieces: number;
  pieces_one_hour: number;
  lines_per_minute: number;
  speed_records: number;
  tags_30min: number;
  turbo_pieces: number;
  speed_quality_combo: number;
  no_pause_streak: number;
  morning_pieces: number;
  pieces_one_day: number;
  speed_top_10: boolean;
  perfect_speed_combo: boolean;

  // Special metrics
  dev_spot: boolean;
  easter_egg: boolean;
  rainbow_piece: boolean;
  birthday_piece: boolean;
  new_year_piece: boolean;
  christmas_piece: boolean;
  halloween_piece: boolean;
  valentine_piece: boolean;
  midnight_piece: boolean;
  sunrise_pieces: number;
  sunset_pieces: number;
  rain_pieces: number;
  snow_pieces: number;
  storm_pieces: number;
  all_seasons: boolean;
  founded_crew: boolean;
  crew_recruited: number;
  solo_pieces: number;
  unique_collabs: number;
  battles_won: number;
  screenshots_taken: number;
  max_likes: number;
  players_helped: number;
  players_trained: number;
  streams: number;
  bugs_reported: number;
  beta_tester: boolean;
  early_player: boolean;
  all_tag_challenges: boolean;
  money_donated: number;
  trades_completed: number;
  custom_designs: number;
  perfect_week: number;
  all_other_achievements: boolean;
  crew_pieces: number;
  hard_spots: number;
}

const STORAGE_KEY = 'cancontrol_achievements';

class AchievementService {
  private getUserAchievements(userId: string): UserAchievement[] {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with all achievements as locked
    return achievements.map(achievement => ({
      achievementId: achievement.id,
      unlocked: false,
      progress: 0,
    }));
  }

  private saveUserAchievements(userId: string, userAchievements: UserAchievement[]): void {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(userAchievements));
  }

  /**
   * Check if a specific achievement requirement is met
   */
  checkAchievement(achievementId: string, userStats: Partial<UserStats>): boolean {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return false;

    return this.checkRequirement(achievement.requirement, userStats);
  }

  private checkRequirement(requirement: AchievementRequirement, userStats: Partial<UserStats>): boolean {
    const { type, value, condition, metric } = requirement;

    switch (type) {
      case 'count':
        if (!metric) return false;
        const currentCount = userStats[metric as keyof UserStats] as number || 0;
        return currentCount >= (value || 0);

      case 'threshold':
        if (!metric) return false;
        const currentValue = userStats[metric as keyof UserStats] as number || 0;
        return currentValue >= (value || 0);

      case 'condition':
        if (!condition) return false;
        const conditionValue = userStats[condition as keyof UserStats];
        return conditionValue === true || (typeof conditionValue === 'number' && conditionValue >= (value || 1));

      case 'combo':
        // For combo achievements, check multiple conditions
        return true; // Implement specific combo logic as needed

      case 'special':
        // For special achievements with custom logic
        return true; // Implement specific special logic as needed

      default:
        return false;
    }
  }

  /**
   * Calculate progress percentage for an achievement
   */
  getAchievementProgress(userId: string, achievementId: string, userStats: Partial<UserStats>): number {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const userAchievements = this.getUserAchievements(userId);
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId);

    if (userAchievement?.unlocked) return 100;

    const { requirement } = achievement;
    const { type, value, metric } = requirement;

    switch (type) {
      case 'count':
      case 'threshold':
        if (!metric || !value) return 0;
        const current = userStats[metric as keyof UserStats] as number || 0;
        return Math.min(100, (current / value) * 100);

      case 'condition':
      case 'special':
        // Binary achievements are either 0% or 100%
        return this.checkAchievement(achievementId, userStats) ? 100 : 0;

      default:
        return 0;
    }
  }

  /**
   * Unlock an achievement and apply rewards
   */
  unlockAchievement(userId: string, achievementId: string): {
    success: boolean;
    achievement?: Achievement;
    rewards?: Achievement['rewards'];
  } {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) {
      return { success: false };
    }

    const userAchievements = this.getUserAchievements(userId);
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId);

    if (userAchievement?.unlocked) {
      return { success: false }; // Already unlocked
    }

    // Update achievement status
    const updatedAchievements = userAchievements.map(ua =>
      ua.achievementId === achievementId
        ? { ...ua, unlocked: true, unlockedAt: Date.now(), progress: 100 }
        : ua
    );

    this.saveUserAchievements(userId, updatedAchievements);

    return {
      success: true,
      achievement,
      rewards: achievement.rewards,
    };
  }

  /**
   * Get all unlocked achievements for a user
   */
  getUnlockedAchievements(userId: string): Achievement[] {
    const userAchievements = this.getUserAchievements(userId);
    const unlockedIds = userAchievements
      .filter(ua => ua.unlocked)
      .map(ua => ua.achievementId);

    return achievements.filter(a => unlockedIds.includes(a.id));
  }

  /**
   * Get all achievements with unlock status
   */
  getAllAchievementsWithStatus(userId: string, userStats: Partial<UserStats>): Array<Achievement & {
    unlocked: boolean;
    unlockedAt?: number;
    progress: number;
  }> {
    const userAchievements = this.getUserAchievements(userId);

    return achievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      const progress = this.getAchievementProgress(userId, achievement.id, userStats);

      return {
        ...achievement,
        unlocked: userAchievement?.unlocked || false,
        unlockedAt: userAchievement?.unlockedAt,
        progress,
      };
    });
  }

  /**
   * Track user actions and check for newly unlocked achievements
   */
  trackAction(
    userId: string,
    actionType: string,
    value: number | boolean,
    userStats: Partial<UserStats>
  ): Achievement[] {
    // Update the specific stat
    const updatedStats = { ...userStats, [actionType]: value };

    // Check all locked achievements
    const userAchievements = this.getUserAchievements(userId);
    const lockedAchievements = achievements.filter(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      return !userAchievement?.unlocked;
    });

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of lockedAchievements) {
      if (this.checkAchievement(achievement.id, updatedStats)) {
        const result = this.unlockAchievement(userId, achievement.id);
        if (result.success && result.achievement) {
          newlyUnlocked.push(result.achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats(userId: string): {
    total: number;
    unlocked: number;
    locked: number;
    byRarity: Record<string, { total: number; unlocked: number }>;
    byCategory: Record<string, { total: number; unlocked: number }>;
  } {
    const userAchievements = this.getUserAchievements(userId);
    const unlocked = userAchievements.filter(ua => ua.unlocked).length;

    const byRarity: Record<string, { total: number; unlocked: number }> = {};
    const byCategory: Record<string, { total: number; unlocked: number }> = {};

    achievements.forEach(achievement => {
      const isUnlocked = userAchievements.find(ua =>
        ua.achievementId === achievement.id && ua.unlocked
      );

      // By rarity
      if (!byRarity[achievement.rarity]) {
        byRarity[achievement.rarity] = { total: 0, unlocked: 0 };
      }
      byRarity[achievement.rarity].total++;
      if (isUnlocked) byRarity[achievement.rarity].unlocked++;

      // By category
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = { total: 0, unlocked: 0 };
      }
      byCategory[achievement.category].total++;
      if (isUnlocked) byCategory[achievement.category].unlocked++;
    });

    return {
      total: achievements.length,
      unlocked,
      locked: achievements.length - unlocked,
      byRarity,
      byCategory,
    };
  }

  /**
   * Reset achievements for a user (for testing or new game)
   */
  resetAchievements(userId: string): void {
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
  }
}

export const achievementService = new AchievementService();
