export type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export type AchievementCategory =
  | 'Beginner'
  | 'Train'
  | 'Art'
  | 'Stealth'
  | 'Location'
  | 'Prestige'
  | 'Speed'
  | 'Special';

export interface AchievementRequirement {
  type: 'count' | 'threshold' | 'combo' | 'condition' | 'special';
  value?: number;
  condition?: string;
  metric?: string;
}

export interface AchievementReward {
  exp: number;
  money: number;
  reputation: number;
  unlocks?: string[];
  boosts?: {
    type: string;
    value: number;
    duration?: number;
  }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  requirement: AchievementRequirement;
  rewards: AchievementReward;
}

export const achievements: Achievement[] = [
  // BEGINNER CATEGORY (30)
  {
    id: 'erste_linie',
    name: 'Erste Linie',
    description: 'Ziehe deine allererste Linie mit der Spraydose',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'PenLine',
    requirement: { type: 'count', value: 1, metric: 'lines_drawn' },
    rewards: { exp: 10, money: 5, reputation: 1 }
  },
  {
    id: 'erster_tag',
    name: 'Erster Tag',
    description: 'Vervollständige deinen ersten Tag',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Paintbrush',
    requirement: { type: 'count', value: 1, metric: 'pieces_completed' },
    rewards: { exp: 25, money: 20, reputation: 5 }
  },
  {
    id: 'anfanger_gluck',
    name: 'Anfängerglück',
    description: 'Erreiche 100 Fame',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Star',
    requirement: { type: 'threshold', value: 100, metric: 'fame' },
    rewards: { exp: 50, money: 30, reputation: 10 }
  },
  {
    id: 'erste_steps',
    name: 'Erste Steps',
    description: 'Male 5 verschiedene Spots',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'MapPin',
    requirement: { type: 'count', value: 5, metric: 'spots_painted' },
    rewards: { exp: 75, money: 50, reputation: 15 }
  },
  {
    id: 'farb_sammler',
    name: 'Farb-Sammler',
    description: 'Kaufe deine erste Farbe im Shop',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Palette',
    requirement: { type: 'count', value: 1, metric: 'colors_bought' },
    rewards: { exp: 20, money: 10, reputation: 5 }
  },
  {
    id: 'spray_rookie',
    name: 'Spray Rookie',
    description: 'Benutze 100 Spraydosen-Sprays',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'SprayCan',
    requirement: { type: 'count', value: 100, metric: 'sprays_used' },
    rewards: { exp: 40, money: 25, reputation: 8 }
  },
  {
    id: 'nacht_aktiv',
    name: 'Nacht-Aktiv',
    description: 'Male deinen ersten Spot nachts',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Moon',
    requirement: { type: 'condition', value: 1, condition: 'night_piece' },
    rewards: { exp: 60, money: 40, reputation: 12 }
  },
  {
    id: 'geld_macher',
    name: 'Geld-Macher',
    description: 'Verdiene insgesamt 500€',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'DollarSign',
    requirement: { type: 'threshold', value: 500, metric: 'total_money_earned' },
    rewards: { exp: 80, money: 100, reputation: 20 }
  },
  {
    id: 'qualitats_start',
    name: 'Qualitäts-Start',
    description: 'Erreiche eine Piece-Qualität von 70%',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Award',
    requirement: { type: 'threshold', value: 70, metric: 'best_quality' },
    rewards: { exp: 100, money: 75, reputation: 25 }
  },
  {
    id: 'equipment_starter',
    name: 'Equipment-Starter',
    description: 'Kaufe dein erstes Spray-Tool Upgrade',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Package',
    requirement: { type: 'count', value: 1, metric: 'tools_bought' },
    rewards: { exp: 50, money: 30, reputation: 10 }
  },
  {
    id: 'tag_meister_start',
    name: 'Tag-Meister Start',
    description: 'Vervollständige 10 Tags',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Type',
    requirement: { type: 'count', value: 10, metric: 'tags_completed' },
    rewards: { exp: 90, money: 60, reputation: 18 }
  },
  {
    id: 'erste_flucht',
    name: 'Erste Flucht',
    description: 'Entkommen der Polizei zum ersten Mal',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Shield',
    requirement: { type: 'count', value: 1, metric: 'escapes' },
    rewards: { exp: 70, money: 50, reputation: 15 }
  },
  {
    id: 'sozialer_start',
    name: 'Sozialer Start',
    description: 'Tritt deiner ersten Crew bei',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Users',
    requirement: { type: 'condition', value: 1, condition: 'joined_crew' },
    rewards: { exp: 60, money: 40, reputation: 20 }
  },
  {
    id: 'spot_entdecker',
    name: 'Spot-Entdecker',
    description: 'Finde 3 versteckte Spots',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Search',
    requirement: { type: 'count', value: 3, metric: 'hidden_spots_found' },
    rewards: { exp: 85, money: 55, reputation: 16 }
  },
  {
    id: 'throwup_beginner',
    name: 'Throwup Beginner',
    description: 'Vervollständige deinen ersten Throwup',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Circle',
    requirement: { type: 'count', value: 1, metric: 'throwups_completed' },
    rewards: { exp: 45, money: 35, reputation: 12 }
  },
  {
    id: 'geld_sparer',
    name: 'Geld-Sparer',
    description: 'Spare 250€ gleichzeitig',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Wallet',
    requirement: { type: 'threshold', value: 250, metric: 'current_money' },
    rewards: { exp: 55, money: 50, reputation: 10 }
  },
  {
    id: 'schnell_start',
    name: 'Schnell-Start',
    description: 'Vervollständige ein Piece in unter 2 Minuten',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Timer',
    requirement: { type: 'threshold', value: 120, metric: 'fastest_piece' },
    rewards: { exp: 80, money: 60, reputation: 15 }
  },
  {
    id: 'farb_palette',
    name: 'Farb-Palette',
    description: 'Besitze 5 verschiedene Farben',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Palette',
    requirement: { type: 'count', value: 5, metric: 'colors_owned' },
    rewards: { exp: 65, money: 45, reputation: 14 }
  },
  {
    id: 'konsistenz_start',
    name: 'Konsistenz-Start',
    description: 'Male 3 Tage hintereinander',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Calendar',
    requirement: { type: 'count', value: 3, metric: 'consecutive_days' },
    rewards: { exp: 75, money: 55, reputation: 18 }
  },
  {
    id: 'ruf_aufbau',
    name: 'Ruf-Aufbau',
    description: 'Erreiche 50 Reputation',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'TrendingUp',
    requirement: { type: 'threshold', value: 50, metric: 'reputation' },
    rewards: { exp: 70, money: 50, reputation: 15 }
  },
  {
    id: 'clean_start',
    name: 'Clean Start',
    description: 'Male 5 Spots ohne erwischt zu werden',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'CheckCircle',
    requirement: { type: 'count', value: 5, metric: 'clean_spots' },
    rewards: { exp: 90, money: 70, reputation: 20 }
  },
  {
    id: 'tool_sammler',
    name: 'Tool-Sammler',
    description: 'Besitze 3 verschiedene Spray-Tools',
    category: 'Beginner',
    rarity: 'COMMON',
    icon: 'Wrench',
    requirement: { type: 'count', value: 3, metric: 'tools_owned' },
    rewards: { exp: 85, money: 65, reputation: 17 }
  },
  {
    id: 'erste_meisterwerk',
    name: 'Erstes Meisterwerk',
    description: 'Erreiche 90% Qualität bei einem Piece',
    category: 'Beginner',
    rarity: 'RARE',
    icon: 'Gem',
    requirement: { type: 'threshold', value: 90, metric: 'best_quality' },
    rewards: { exp: 150, money: 100, reputation: 35 }
  },
  {
    id: 'spot_veteran',
    name: 'Spot-Veteran',
    description: 'Male 15 verschiedene Spots',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Map',
    requirement: { type: 'count', value: 15, metric: 'spots_painted' },
    rewards: { exp: 120, money: 85, reputation: 28 }
  },
  {
    id: 'fame_jager',
    name: 'Fame-Jäger',
    description: 'Erreiche 250 Fame',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Sparkles',
    requirement: { type: 'threshold', value: 250, metric: 'fame' },
    rewards: { exp: 100, money: 75, reputation: 22 }
  },
  {
    id: 'nacht_eule',
    name: 'Nacht-Eule',
    description: 'Male 5 Spots zwischen 22-6 Uhr',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Moon',
    requirement: { type: 'count', value: 5, metric: 'night_pieces' },
    rewards: { exp: 95, money: 70, reputation: 24 }
  },
  {
    id: 'piece_starter',
    name: 'Piece-Starter',
    description: 'Vervollständige dein erstes großes Piece',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Image',
    requirement: { type: 'count', value: 1, metric: 'pieces_completed' },
    rewards: { exp: 110, money: 80, reputation: 26 }
  },
  {
    id: 'crew_aktiv',
    name: 'Crew-Aktiv',
    description: 'Male 5 Spots mit Crew-Mitgliedern',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Users',
    requirement: { type: 'count', value: 5, metric: 'crew_pieces' },
    rewards: { exp: 105, money: 75, reputation: 25 }
  },
  {
    id: 'risiko_nehmer',
    name: 'Risiko-Nehmer',
    description: 'Male einen Hard-Difficulty Spot',
    category: 'Beginner',
    rarity: 'RARE',
    icon: 'Flame',
    requirement: { type: 'count', value: 1, metric: 'hard_spots' },
    rewards: { exp: 130, money: 90, reputation: 30 }
  },
  {
    id: 'produktiv',
    name: 'Produktiv',
    description: 'Vervollständige 25 Pieces insgesamt',
    category: 'Beginner',
    rarity: 'UNCOMMON',
    icon: 'Target',
    requirement: { type: 'count', value: 25, metric: 'pieces_completed' },
    rewards: { exp: 125, money: 85, reputation: 28 }
  },

  // TRAIN CATEGORY (40)
  {
    id: 'train_tagger',
    name: 'Train Tagger',
    description: 'Male deinen ersten Zug',
    category: 'Train',
    rarity: 'UNCOMMON',
    icon: 'Train',
    requirement: { type: 'count', value: 1, metric: 'trains_painted' },
    rewards: { exp: 100, money: 80, reputation: 25 }
  },
  {
    id: 'subway_surfer',
    name: 'Subway Surfer',
    description: 'Male 5 U-Bahn Züge',
    category: 'Train',
    rarity: 'UNCOMMON',
    icon: 'TrainTrack',
    requirement: { type: 'count', value: 5, metric: 'subway_trains' },
    rewards: { exp: 150, money: 120, reputation: 35 }
  },
  {
    id: 'whole_car',
    name: 'Whole Car',
    description: 'Male einen kompletten Wagon',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Square',
    requirement: { type: 'count', value: 1, metric: 'whole_cars' },
    rewards: { exp: 250, money: 200, reputation: 50 }
  },
  {
    id: 'end_to_end',
    name: 'End to End',
    description: 'Male einen Wagon von Ende zu Ende',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Maximize2',
    requirement: { type: 'count', value: 1, metric: 'end_to_end' },
    rewards: { exp: 300, money: 250, reputation: 60 }
  },
  {
    id: 'top_to_bottom',
    name: 'Top to Bottom',
    description: 'Male einen Wagon von oben bis unten',
    category: 'Train',
    rarity: 'RARE',
    icon: 'ArrowDownUp',
    requirement: { type: 'count', value: 1, metric: 'top_to_bottom' },
    rewards: { exp: 280, money: 230, reputation: 55 }
  },
  {
    id: 'train_bomber',
    name: 'Train Bomber',
    description: 'Male 10 verschiedene Züge',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Bomb',
    requirement: { type: 'count', value: 10, metric: 'unique_trains' },
    rewards: { exp: 350, money: 300, reputation: 70 }
  },
  {
    id: 'night_train',
    name: 'Night Train',
    description: 'Male einen Zug zwischen 2-4 Uhr nachts',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'MoonStar',
    requirement: { type: 'condition', value: 1, condition: 'night_train' },
    rewards: { exp: 400, money: 350, reputation: 80 }
  },
  {
    id: 'yard_king',
    name: 'Yard King',
    description: 'Male 15 Züge in Bahnhöfen',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Crown',
    requirement: { type: 'count', value: 15, metric: 'yard_trains' },
    rewards: { exp: 500, money: 450, reputation: 100 }
  },
  {
    id: 'rolling_canvas',
    name: 'Rolling Canvas',
    description: 'Male 25 Züge insgesamt',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Layers',
    requirement: { type: 'count', value: 25, metric: 'trains_painted' },
    rewards: { exp: 600, money: 550, reputation: 120 }
  },
  {
    id: 'metro_master',
    name: 'Metro Master',
    description: 'Male alle U-Bahn Linien mindestens einmal',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Network',
    requirement: { type: 'condition', value: 1, condition: 'all_metro_lines' },
    rewards: { exp: 550, money: 500, reputation: 110 }
  },
  {
    id: 'train_legend',
    name: 'Train Legend',
    description: 'Male 50 Züge',
    category: 'Train',
    rarity: 'LEGENDARY',
    icon: 'Medal',
    requirement: { type: 'count', value: 50, metric: 'trains_painted' },
    rewards: { exp: 1000, money: 900, reputation: 200, unlocks: ['legendary_train_colors'] }
  },
  {
    id: 'silver_bullet',
    name: 'Silver Bullet',
    description: 'Male einen fahrenden Zug',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Zap',
    requirement: { type: 'count', value: 1, metric: 'moving_trains' },
    rewards: { exp: 450, money: 400, reputation: 90 }
  },
  {
    id: 'freight_king',
    name: 'Freight King',
    description: 'Male 10 Güterzüge',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Container',
    requirement: { type: 'count', value: 10, metric: 'freight_trains' },
    rewards: { exp: 320, money: 280, reputation: 65 }
  },
  {
    id: 'express_artist',
    name: 'Express Artist',
    description: 'Male einen Zug in unter 5 Minuten',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Rocket',
    requirement: { type: 'threshold', value: 300, metric: 'fastest_train' },
    rewards: { exp: 270, money: 220, reputation: 52 }
  },
  {
    id: 'panel_piece',
    name: 'Panel Piece',
    description: 'Male 20 Train Panels',
    category: 'Train',
    rarity: 'UNCOMMON',
    icon: 'LayoutPanelTop',
    requirement: { type: 'count', value: 20, metric: 'panels_painted' },
    rewards: { exp: 180, money: 150, reputation: 40 }
  },
  {
    id: 'train_character',
    name: 'Train Character',
    description: 'Male 5 Character-Pieces auf Zügen',
    category: 'Train',
    rarity: 'RARE',
    icon: 'User',
    requirement: { type: 'count', value: 5, metric: 'train_characters' },
    rewards: { exp: 290, money: 240, reputation: 58 }
  },
  {
    id: 'clean_train',
    name: 'Clean Train',
    description: 'Male einen Zug ohne Alarm auszulösen',
    category: 'Train',
    rarity: 'RARE',
    icon: 'ShieldCheck',
    requirement: { type: 'count', value: 1, metric: 'clean_trains' },
    rewards: { exp: 310, money: 260, reputation: 62 }
  },
  {
    id: 'train_crew',
    name: 'Train Crew',
    description: 'Male 3 Züge mit deiner Crew',
    category: 'Train',
    rarity: 'UNCOMMON',
    icon: 'Users2',
    requirement: { type: 'count', value: 3, metric: 'crew_trains' },
    rewards: { exp: 200, money: 170, reputation: 45 }
  },
  {
    id: 'commuter_king',
    name: 'Commuter King',
    description: 'Male 15 Pendlerzüge',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Clock',
    requirement: { type: 'count', value: 15, metric: 'commuter_trains' },
    rewards: { exp: 330, money: 290, reputation: 68 }
  },
  {
    id: 'international_train',
    name: 'International Train',
    description: 'Male einen Fernverkehrszug',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Globe',
    requirement: { type: 'count', value: 1, metric: 'international_trains' },
    rewards: { exp: 420, money: 370, reputation: 85 }
  },
  {
    id: 'color_blast',
    name: 'Color Blast',
    description: 'Benutze 10+ Farben auf einem Zug',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Rainbow',
    requirement: { type: 'threshold', value: 10, metric: 'colors_on_train' },
    rewards: { exp: 260, money: 210, reputation: 48 }
  },
  {
    id: 'train_takeover',
    name: 'Train Takeover',
    description: 'Male 3 Wagons eines Zuges',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Maximize',
    requirement: { type: 'count', value: 1, metric: 'train_takeovers' },
    rewards: { exp: 480, money: 420, reputation: 95 }
  },
  {
    id: 'stealth_train',
    name: 'Stealth Train',
    description: 'Male 5 Züge ohne gesehen zu werden',
    category: 'Train',
    rarity: 'RARE',
    icon: 'EyeOff',
    requirement: { type: 'count', value: 5, metric: 'stealth_trains' },
    rewards: { exp: 340, money: 300, reputation: 72 }
  },
  {
    id: 'train_quality',
    name: 'Train Quality',
    description: 'Erreiche 85% Qualität auf einem Zug',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Star',
    requirement: { type: 'threshold', value: 85, metric: 'best_train_quality' },
    rewards: { exp: 300, money: 250, reputation: 60 }
  },
  {
    id: 'sunrise_train',
    name: 'Sunrise Train',
    description: 'Male einen Zug bei Sonnenaufgang',
    category: 'Train',
    rarity: 'UNCOMMON',
    icon: 'Sunrise',
    requirement: { type: 'condition', value: 1, condition: 'sunrise_train' },
    rewards: { exp: 190, money: 160, reputation: 42 }
  },
  {
    id: 'station_master',
    name: 'Station Master',
    description: 'Male in 10 verschiedenen Bahnhöfen',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Building',
    requirement: { type: 'count', value: 10, metric: 'unique_stations' },
    rewards: { exp: 360, money: 310, reputation: 75 }
  },
  {
    id: 'train_marathon',
    name: 'Train Marathon',
    description: 'Male 5 Züge an einem Tag',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Timer',
    requirement: { type: 'count', value: 5, metric: 'trains_one_day' },
    rewards: { exp: 440, money: 390, reputation: 88 }
  },
  {
    id: 'underground_king',
    name: 'Underground King',
    description: 'Male 30 U-Bahn Züge',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'TrendingDown',
    requirement: { type: 'count', value: 30, metric: 'subway_trains' },
    rewards: { exp: 520, money: 470, reputation: 105 }
  },
  {
    id: 'train_perfectionist',
    name: 'Train Perfectionist',
    description: 'Erreiche 95% Qualität auf einem Zug',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Award',
    requirement: { type: 'threshold', value: 95, metric: 'best_train_quality' },
    rewards: { exp: 560, money: 510, reputation: 115 }
  },
  {
    id: 'rush_hour',
    name: 'Rush Hour',
    description: 'Male einen Zug während der Stoßzeit',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'AlertCircle',
    requirement: { type: 'condition', value: 1, condition: 'rush_hour_train' },
    rewards: { exp: 490, money: 440, reputation: 98 }
  },
  {
    id: 'vintage_train',
    name: 'Vintage Train',
    description: 'Male einen historischen Zug',
    category: 'Train',
    rarity: 'RARE',
    icon: 'History',
    requirement: { type: 'count', value: 1, metric: 'vintage_trains' },
    rewards: { exp: 350, money: 305, reputation: 73 }
  },
  {
    id: 'train_dynasty',
    name: 'Train Dynasty',
    description: 'Male 100 Züge insgesamt',
    category: 'Train',
    rarity: 'LEGENDARY',
    icon: 'Trophy',
    requirement: { type: 'count', value: 100, metric: 'trains_painted' },
    rewards: { exp: 1500, money: 1300, reputation: 300, unlocks: ['exclusive_train_tools'] }
  },
  {
    id: 'speed_painter',
    name: 'Speed Painter',
    description: 'Male einen Zug in unter 3 Minuten',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Gauge',
    requirement: { type: 'threshold', value: 180, metric: 'fastest_train' },
    rewards: { exp: 470, money: 420, reputation: 93 }
  },
  {
    id: 'layup_legend',
    name: 'Layup Legend',
    description: 'Male 20 Züge in Abstellgleisen',
    category: 'Train',
    rarity: 'RARE',
    icon: 'ParkingSquare',
    requirement: { type: 'count', value: 20, metric: 'layup_trains' },
    rewards: { exp: 380, money: 330, reputation: 78 }
  },
  {
    id: 'train_explorer',
    name: 'Train Explorer',
    description: 'Male Züge in 5 verschiedenen Städten',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Compass',
    requirement: { type: 'count', value: 5, metric: 'cities_trains' },
    rewards: { exp: 510, money: 460, reputation: 102 }
  },
  {
    id: 'double_decker',
    name: 'Double Decker',
    description: 'Male einen Doppelstockzug',
    category: 'Train',
    rarity: 'UNCOMMON',
    icon: 'Layers2',
    requirement: { type: 'count', value: 1, metric: 'double_decker_trains' },
    rewards: { exp: 210, money: 180, reputation: 46 }
  },
  {
    id: 'train_writer',
    name: 'Train Writer',
    description: 'Schreibe deinen Namen auf 10 Zügen',
    category: 'Train',
    rarity: 'RARE',
    icon: 'PenTool',
    requirement: { type: 'count', value: 10, metric: 'train_signatures' },
    rewards: { exp: 290, money: 245, reputation: 57 }
  },
  {
    id: 'maintenance_raid',
    name: 'Maintenance Raid',
    description: 'Male in einem Wartungsdepot',
    category: 'Train',
    rarity: 'EPIC',
    icon: 'Wrench',
    requirement: { type: 'count', value: 1, metric: 'depot_trains' },
    rewards: { exp: 530, money: 480, reputation: 108 }
  },
  {
    id: 'train_collector',
    name: 'Train Collector',
    description: 'Male 5 verschiedene Zugtypen',
    category: 'Train',
    rarity: 'RARE',
    icon: 'Album',
    requirement: { type: 'count', value: 5, metric: 'unique_train_types' },
    rewards: { exp: 320, money: 275, reputation: 64 }
  },

  // ART CATEGORY (35)
  {
    id: 'wildstyle_warrior',
    name: 'Wildstyle Warrior',
    description: 'Vervollständige 10 Wildstyle Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Sparkle',
    requirement: { type: 'count', value: 10, metric: 'wildstyle_pieces' },
    rewards: { exp: 350, money: 300, reputation: 70 }
  },
  {
    id: 'character_artist',
    name: 'Character Artist',
    description: 'Male 15 Character-Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'UserCircle',
    requirement: { type: 'count', value: 15, metric: 'character_pieces' },
    rewards: { exp: 380, money: 330, reputation: 75 }
  },
  {
    id: 'style_master',
    name: 'Style Master',
    description: 'Benutze 5 verschiedene Styles',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Brush',
    requirement: { type: 'count', value: 5, metric: 'unique_styles' },
    rewards: { exp: 200, money: 170, reputation: 45 }
  },
  {
    id: 'color_theory',
    name: 'Color Theory',
    description: 'Benutze 20 verschiedene Farben',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Pipette',
    requirement: { type: 'count', value: 20, metric: 'colors_used' },
    rewards: { exp: 180, money: 150, reputation: 40 }
  },
  {
    id: '3d_master',
    name: '3D Master',
    description: 'Vervollständige 8 3D-Style Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Box',
    requirement: { type: 'count', value: 8, metric: '3d_pieces' },
    rewards: { exp: 320, money: 280, reputation: 65 }
  },
  {
    id: 'bubble_specialist',
    name: 'Bubble Specialist',
    description: 'Male 12 Bubble-Letter Pieces',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Circle',
    requirement: { type: 'count', value: 12, metric: 'bubble_pieces' },
    rewards: { exp: 190, money: 160, reputation: 42 }
  },
  {
    id: 'masterpiece_creator',
    name: 'Masterpiece Creator',
    description: 'Erreiche 95% Qualität bei 5 Pieces',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'Crown',
    requirement: { type: 'count', value: 5, metric: 'masterpiece_pieces' },
    rewards: { exp: 500, money: 450, reputation: 100 }
  },
  {
    id: 'abstract_artist',
    name: 'Abstract Artist',
    description: 'Vervollständige 10 abstrakte Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Shapes',
    requirement: { type: 'count', value: 10, metric: 'abstract_pieces' },
    rewards: { exp: 300, money: 260, reputation: 60 }
  },
  {
    id: 'portrait_pro',
    name: 'Portrait Pro',
    description: 'Male 5 Portrait-Pieces',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'UserSquare2',
    requirement: { type: 'count', value: 5, metric: 'portrait_pieces' },
    rewards: { exp: 450, money: 400, reputation: 90 }
  },
  {
    id: 'komplexitat_konig',
    name: 'Komplexität König',
    description: 'Vervollständige ein Piece mit 100+ Elementen',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'Layers',
    requirement: { type: 'threshold', value: 100, metric: 'max_elements' },
    rewards: { exp: 480, money: 430, reputation: 95 }
  },
  {
    id: 'farb_harmonie',
    name: 'Farb-Harmonie',
    description: 'Benutze perfekt harmonierende Farben in 10 Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Palette',
    requirement: { type: 'count', value: 10, metric: 'harmonic_pieces' },
    rewards: { exp: 330, money: 290, reputation: 68 }
  },
  {
    id: 'stencil_master',
    name: 'Stencil Master',
    description: 'Benutze 15 verschiedene Stencils',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Stamp',
    requirement: { type: 'count', value: 15, metric: 'stencils_used' },
    rewards: { exp: 220, money: 190, reputation: 48 }
  },
  {
    id: 'spray_kontrolle',
    name: 'Spray-Kontrolle',
    description: 'Erreiche 90% Präzision in 20 Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Target',
    requirement: { type: 'count', value: 20, metric: 'precision_pieces' },
    rewards: { exp: 360, money: 315, reputation: 72 }
  },
  {
    id: 'background_king',
    name: 'Background King',
    description: 'Erstelle 15 aufwendige Hintergründe',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Image',
    requirement: { type: 'count', value: 15, metric: 'complex_backgrounds' },
    rewards: { exp: 240, money: 205, reputation: 51 }
  },
  {
    id: 'detail_meister',
    name: 'Detail-Meister',
    description: 'Füge 500+ Details zu Pieces hinzu',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Focus',
    requirement: { type: 'count', value: 500, metric: 'details_added' },
    rewards: { exp: 340, money: 295, reputation: 69 }
  },
  {
    id: 'outline_expert',
    name: 'Outline Expert',
    description: 'Erstelle perfekte Outlines in 25 Pieces',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Square',
    requirement: { type: 'count', value: 25, metric: 'perfect_outlines' },
    rewards: { exp: 250, money: 215, reputation: 53 }
  },
  {
    id: 'fill_master',
    name: 'Fill Master',
    description: 'Beherrsche 10 verschiedene Fill-Techniken',
    category: 'Art',
    rarity: 'RARE',
    icon: 'PaintBucket',
    requirement: { type: 'count', value: 10, metric: 'fill_techniques' },
    rewards: { exp: 310, money: 270, reputation: 63 }
  },
  {
    id: 'schatten_spezialist',
    name: 'Schatten-Spezialist',
    description: 'Füge perfekte Schatten zu 20 Pieces hinzu',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Cloud',
    requirement: { type: 'count', value: 20, metric: 'shadow_pieces' },
    rewards: { exp: 230, money: 200, reputation: 49 }
  },
  {
    id: 'glow_artist',
    name: 'Glow Artist',
    description: 'Erstelle 15 Pieces mit Glow-Effekten',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Sun',
    requirement: { type: 'count', value: 15, metric: 'glow_pieces' },
    rewards: { exp: 290, money: 250, reputation: 58 }
  },
  {
    id: 'letter_perfection',
    name: 'Letter Perfection',
    description: 'Schreibe 50 perfekte Buchstaben',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Type',
    requirement: { type: 'count', value: 50, metric: 'perfect_letters' },
    rewards: { exp: 210, money: 180, reputation: 46 }
  },
  {
    id: 'connection_master',
    name: 'Connection Master',
    description: 'Verbinde Buchstaben perfekt in 15 Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Link',
    requirement: { type: 'count', value: 15, metric: 'connected_pieces' },
    rewards: { exp: 280, money: 240, reputation: 56 }
  },
  {
    id: 'gradient_guru',
    name: 'Gradient Guru',
    description: 'Benutze Farbverläufe in 20 Pieces',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Blend',
    requirement: { type: 'count', value: 20, metric: 'gradient_pieces' },
    rewards: { exp: 260, money: 225, reputation: 54 }
  },
  {
    id: 'dimension_master',
    name: 'Dimension Master',
    description: 'Erstelle 10 Pieces mit perfekter Tiefe',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'Layers3',
    requirement: { type: 'count', value: 10, metric: 'dimension_pieces' },
    rewards: { exp: 420, money: 370, reputation: 85 }
  },
  {
    id: 'symmetrie_spezialist',
    name: 'Symmetrie-Spezialist',
    description: 'Erstelle 12 perfekt symmetrische Pieces',
    category: 'Art',
    rarity: 'RARE',
    icon: 'FlipVertical',
    requirement: { type: 'count', value: 12, metric: 'symmetric_pieces' },
    rewards: { exp: 270, money: 235, reputation: 55 }
  },
  {
    id: 'background_detail',
    name: 'Background Detail',
    description: 'Füge komplexe Background-Elemente zu 25 Pieces hinzu',
    category: 'Art',
    rarity: 'RARE',
    icon: 'FileImage',
    requirement: { type: 'count', value: 25, metric: 'detailed_backgrounds' },
    rewards: { exp: 350, money: 305, reputation: 71 }
  },
  {
    id: 'arrow_expert',
    name: 'Arrow Expert',
    description: 'Füge stylische Arrows zu 20 Pieces hinzu',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'ArrowRight',
    requirement: { type: 'count', value: 20, metric: 'arrow_pieces' },
    rewards: { exp: 200, money: 175, reputation: 44 }
  },
  {
    id: 'highlight_hero',
    name: 'Highlight Hero',
    description: 'Setze perfekte Highlights in 30 Pieces',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Lightbulb',
    requirement: { type: 'count', value: 30, metric: 'highlight_pieces' },
    rewards: { exp: 270, money: 230, reputation: 57 }
  },
  {
    id: 'force_field',
    name: 'Force Field',
    description: 'Erstelle 8 Pieces mit Force-Field Effekten',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Shield',
    requirement: { type: 'count', value: 8, metric: 'forcefield_pieces' },
    rewards: { exp: 300, money: 265, reputation: 61 }
  },
  {
    id: 'chrome_letters',
    name: 'Chrome Letters',
    description: 'Male 10 Pieces mit Chrome-Effekt',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'Chrome',
    requirement: { type: 'count', value: 10, metric: 'chrome_pieces' },
    rewards: { exp: 460, money: 410, reputation: 92 }
  },
  {
    id: 'drip_master',
    name: 'Drip Master',
    description: 'Füge realistische Drips zu 15 Pieces hinzu',
    category: 'Art',
    rarity: 'UNCOMMON',
    icon: 'Droplet',
    requirement: { type: 'count', value: 15, metric: 'drip_pieces' },
    rewards: { exp: 190, money: 165, reputation: 43 }
  },
  {
    id: 'piece_evolution',
    name: 'Piece Evolution',
    description: 'Entwickle deinen Style über 50 Pieces',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'TrendingUp',
    requirement: { type: 'count', value: 50, metric: 'style_evolution' },
    rewards: { exp: 550, money: 500, reputation: 110 }
  },
  {
    id: 'mixed_media',
    name: 'Mixed Media',
    description: 'Kombiniere 5 verschiedene Techniken in einem Piece',
    category: 'Art',
    rarity: 'EPIC',
    icon: 'Combine',
    requirement: { type: 'threshold', value: 5, metric: 'techniques_combined' },
    rewards: { exp: 490, money: 440, reputation: 98 }
  },
  {
    id: 'konsistente_qualitat',
    name: 'Konsistente Qualität',
    description: 'Erreiche 80%+ Qualität in 30 Pieces hintereinander',
    category: 'Art',
    rarity: 'LEGENDARY',
    icon: 'Medal',
    requirement: { type: 'count', value: 30, metric: 'consistent_quality' },
    rewards: { exp: 1000, money: 900, reputation: 200, unlocks: ['elite_art_tools'] }
  },
  {
    id: 'kunstler_seele',
    name: 'Künstler-Seele',
    description: 'Vervollständige 100 hochwertige Pieces',
    category: 'Art',
    rarity: 'LEGENDARY',
    icon: 'Heart',
    requirement: { type: 'count', value: 100, metric: 'quality_pieces' },
    rewards: { exp: 1200, money: 1100, reputation: 250, unlocks: ['signature_style'] }
  },
  {
    id: 'color_explosion',
    name: 'Color Explosion',
    description: 'Benutze 15+ Farben in einem Piece',
    category: 'Art',
    rarity: 'RARE',
    icon: 'Sparkles',
    requirement: { type: 'threshold', value: 15, metric: 'colors_in_piece' },
    rewards: { exp: 320, money: 280, reputation: 66 }
  },

  // STEALTH CATEGORY (30)
  {
    id: 'ghost_artist',
    name: 'Ghost Artist',
    description: 'Vervollständige 10 Pieces ohne gesehen zu werden',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Ghost',
    requirement: { type: 'count', value: 10, metric: 'stealth_pieces' },
    rewards: { exp: 350, money: 300, reputation: 70 }
  },
  {
    id: 'ninja_painter',
    name: 'Ninja Painter',
    description: 'Male 5 Spots mit Guards ohne entdeckt zu werden',
    category: 'Stealth',
    rarity: 'EPIC',
    icon: 'EyeOff',
    requirement: { type: 'count', value: 5, metric: 'guard_stealth' },
    rewards: { exp: 450, money: 400, reputation: 90 }
  },
  {
    id: 'schatten_meister',
    name: 'Schatten-Meister',
    description: 'Male 20 Pieces nachts unentdeckt',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Moon',
    requirement: { type: 'count', value: 20, metric: 'night_stealth' },
    rewards: { exp: 380, money: 330, reputation: 75 }
  },
  {
    id: 'quick_escape',
    name: 'Quick Escape',
    description: 'Entkommen der Polizei in unter 30 Sekunden',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Zap',
    requirement: { type: 'threshold', value: 30, metric: 'fastest_escape' },
    rewards: { exp: 200, money: 170, reputation: 45 }
  },
  {
    id: 'unsichtbar',
    name: 'Unsichtbar',
    description: 'Male 15 Pieces ohne Wanted-Level zu bekommen',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'ShieldOff',
    requirement: { type: 'count', value: 15, metric: 'no_wanted' },
    rewards: { exp: 320, money: 280, reputation: 65 }
  },
  {
    id: 'crowd_blend',
    name: 'Crowd Blend',
    description: 'Verstecke dich 10x in Menschenmengen',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Users',
    requirement: { type: 'count', value: 10, metric: 'crowd_hides' },
    rewards: { exp: 180, money: 150, reputation: 40 }
  },
  {
    id: 'rooftop_runner',
    name: 'Rooftop Runner',
    description: 'Entkommen über Dächer 5x',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Home',
    requirement: { type: 'count', value: 5, metric: 'rooftop_escapes' },
    rewards: { exp: 290, money: 250, reputation: 58 }
  },
  {
    id: 'silent_skills',
    name: 'Silent Skills',
    description: 'Male 50 Pieces ohne Alarm auszulösen',
    category: 'Stealth',
    rarity: 'EPIC',
    icon: 'Volume',
    requirement: { type: 'count', value: 50, metric: 'silent_pieces' },
    rewards: { exp: 500, money: 450, reputation: 100 }
  },
  {
    id: 'kamera_trick',
    name: 'Kamera-Trick',
    description: 'Umgehe 20 Überwachungskameras',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Video',
    requirement: { type: 'count', value: 20, metric: 'cameras_avoided' },
    rewards: { exp: 220, money: 190, reputation: 48 }
  },
  {
    id: 'houdini',
    name: 'Houdini',
    description: 'Entkommen aus 3-Sterne Wanted-Level',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Sparkle',
    requirement: { type: 'count', value: 1, metric: 'three_star_escape' },
    rewards: { exp: 360, money: 315, reputation: 72 }
  },
  {
    id: 'parkour_pro',
    name: 'Parkour Pro',
    description: 'Benutze Parkour für 15 Fluchtversuche',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Footprints',
    requirement: { type: 'count', value: 15, metric: 'parkour_escapes' },
    rewards: { exp: 240, money: 205, reputation: 51 }
  },
  {
    id: 'master_of_disguise',
    name: 'Master of Disguise',
    description: 'Benutze 5 verschiedene Verkleidungen',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'UserCog',
    requirement: { type: 'count', value: 5, metric: 'disguises_used' },
    rewards: { exp: 310, money: 270, reputation: 63 }
  },
  {
    id: 'wachter_trick',
    name: 'Wächter-Trick',
    description: 'Lenke Guards 10x ab',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Bell',
    requirement: { type: 'count', value: 10, metric: 'guards_distracted' },
    rewards: { exp: 190, money: 160, reputation: 42 }
  },
  {
    id: 'versteck_experte',
    name: 'Versteck-Experte',
    description: 'Finde und benutze 15 geheime Verstecke',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Archive',
    requirement: { type: 'count', value: 15, metric: 'hideouts_used' },
    rewards: { exp: 280, money: 240, reputation: 56 }
  },
  {
    id: 'tunnel_rat',
    name: 'Tunnel Rat',
    description: 'Entkommen durch Kanalisation 8x',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Waves',
    requirement: { type: 'count', value: 8, metric: 'sewer_escapes' },
    rewards: { exp: 210, money: 180, reputation: 46 }
  },
  {
    id: 'zero_wanted',
    name: 'Zero Wanted',
    description: 'Male 25 Pieces ohne jemals Wanted zu bekommen',
    category: 'Stealth',
    rarity: 'EPIC',
    icon: 'ShieldCheck',
    requirement: { type: 'count', value: 25, metric: 'zero_wanted_pieces' },
    rewards: { exp: 480, money: 430, reputation: 95 }
  },
  {
    id: 'lockpick_master',
    name: 'Lockpick Master',
    description: 'Öffne 20 verschlossene Bereiche',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'KeyRound',
    requirement: { type: 'count', value: 20, metric: 'locks_picked' },
    rewards: { exp: 340, money: 295, reputation: 69 }
  },
  {
    id: 'timing_perfect',
    name: 'Timing Perfect',
    description: 'Male während Patrouillen-Wechsel 10x',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Clock',
    requirement: { type: 'count', value: 10, metric: 'timing_pieces' },
    rewards: { exp: 300, money: 260, reputation: 60 }
  },
  {
    id: 'alarm_hacker',
    name: 'Alarm Hacker',
    description: 'Deaktiviere 15 Alarmsysteme',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'AlertOctagon',
    requirement: { type: 'count', value: 15, metric: 'alarms_disabled' },
    rewards: { exp: 250, money: 215, reputation: 53 }
  },
  {
    id: 'schatten_tanz',
    name: 'Schatten-Tanz',
    description: 'Bewege dich 100x durch Schatten',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Move',
    requirement: { type: 'count', value: 100, metric: 'shadow_movements' },
    rewards: { exp: 230, money: 200, reputation: 49 }
  },
  {
    id: 'smoke_screen',
    name: 'Smoke Screen',
    description: 'Benutze Rauchgranaten für 12 Fluchtversuche',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Wind',
    requirement: { type: 'count', value: 12, metric: 'smoke_escapes' },
    rewards: { exp: 200, money: 175, reputation: 44 }
  },
  {
    id: 'fahrzeug_flucht',
    name: 'Fahrzeug-Flucht',
    description: 'Entkommen mit Fahrzeugen 10x',
    category: 'Stealth',
    rarity: 'UNCOMMON',
    icon: 'Car',
    requirement: { type: 'count', value: 10, metric: 'vehicle_escapes' },
    rewards: { exp: 270, money: 230, reputation: 57 }
  },
  {
    id: 'dach_springer',
    name: 'Dach-Springer',
    description: 'Springe zwischen 20 Gebäuden',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Move3d',
    requirement: { type: 'count', value: 20, metric: 'building_jumps' },
    rewards: { exp: 330, money: 290, reputation: 68 }
  },
  {
    id: 'lautlos',
    name: 'Lautlos',
    description: 'Vervollständige 30 Pieces ohne Geräusch',
    category: 'Stealth',
    rarity: 'EPIC',
    icon: 'VolumeX',
    requirement: { type: 'count', value: 30, metric: 'silent_pieces' },
    rewards: { exp: 520, money: 470, reputation: 105 }
  },
  {
    id: 'polizei_trickster',
    name: 'Polizei-Trickster',
    description: 'Täusche die Polizei 25x',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Drama',
    requirement: { type: 'count', value: 25, metric: 'police_tricks' },
    rewards: { exp: 370, money: 325, reputation: 74 }
  },
  {
    id: 'unsichtbare_legende',
    name: 'Unsichtbare Legende',
    description: 'Erreiche 100 Pieces ohne jemals erwischt zu werden',
    category: 'Stealth',
    rarity: 'LEGENDARY',
    icon: 'Ghost',
    requirement: { type: 'count', value: 100, metric: 'never_caught' },
    rewards: { exp: 1500, money: 1300, reputation: 300, unlocks: ['stealth_master_gear'] }
  },
  {
    id: 'tagsüber_unsichtbar',
    name: 'Tagsüber Unsichtbar',
    description: 'Male 15 Pieces tagsüber ohne entdeckt zu werden',
    category: 'Stealth',
    rarity: 'EPIC',
    icon: 'Sun',
    requirement: { type: 'count', value: 15, metric: 'day_stealth' },
    rewards: { exp: 550, money: 500, reputation: 110 }
  },
  {
    id: 'flucht_artist',
    name: 'Flucht-Artist',
    description: 'Entkommen auf 10 verschiedene Arten',
    category: 'Stealth',
    rarity: 'RARE',
    icon: 'Route',
    requirement: { type: 'count', value: 10, metric: 'escape_methods' },
    rewards: { exp: 350, money: 305, reputation: 71 }
  },
  {
    id: 'close_call',
    name: 'Close Call',
    description: 'Entkommen mit weniger als 5% Zeit übrig 5x',
    category: 'Stealth',
    rarity: 'EPIC',
    icon: 'AlertTriangle',
    requirement: { type: 'count', value: 5, metric: 'close_escapes' },
    rewards: { exp: 490, money: 440, reputation: 98 }
  },
  {
    id: 'perfekte_mission',
    name: 'Perfekte Mission',
    description: 'Vervollständige 50 Pieces mit perfekter Stealth',
    category: 'Stealth',
    rarity: 'LEGENDARY',
    icon: 'Award',
    requirement: { type: 'count', value: 50, metric: 'perfect_stealth' },
    rewards: { exp: 1200, money: 1100, reputation: 250, unlocks: ['stealth_legend_title'] }
  },

  // LOCATION CATEGORY (35)
  {
    id: 'city_explorer',
    name: 'City Explorer',
    description: 'Male in 10 verschiedenen Stadtteilen',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'MapPin',
    requirement: { type: 'count', value: 10, metric: 'unique_districts' },
    rewards: { exp: 200, money: 170, reputation: 45 }
  },
  {
    id: 'metro_artist',
    name: 'Metro Artist',
    description: 'Male in allen U-Bahn Stationen',
    category: 'Location',
    rarity: 'RARE',
    icon: 'TrainTrack',
    requirement: { type: 'condition', value: 1, condition: 'all_metro_stations' },
    rewards: { exp: 350, money: 300, reputation: 70 }
  },
  {
    id: 'hohen_jager',
    name: 'Höhen-Jäger',
    description: 'Male auf 15 hohen Gebäuden',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Building2',
    requirement: { type: 'count', value: 15, metric: 'high_buildings' },
    rewards: { exp: 320, money: 280, reputation: 65 }
  },
  {
    id: 'bruken_bomber',
    name: 'Brücken-Bomber',
    description: 'Male auf 8 verschiedenen Brücken',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'Bridge',
    requirement: { type: 'count', value: 8, metric: 'unique_bridges' },
    rewards: { exp: 240, money: 205, reputation: 51 }
  },
  {
    id: 'tunnel_vision',
    name: 'Tunnel Vision',
    description: 'Male in 10 Tunneln',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'CircleDot',
    requirement: { type: 'count', value: 10, metric: 'tunnels_painted' },
    rewards: { exp: 220, money: 190, reputation: 48 }
  },
  {
    id: 'abandoned_artist',
    name: 'Abandoned Artist',
    description: 'Finde und male 12 verlassene Gebäude',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Building',
    requirement: { type: 'count', value: 12, metric: 'abandoned_buildings' },
    rewards: { exp: 380, money: 330, reputation: 75 }
  },
  {
    id: 'park_pieces',
    name: 'Park Pieces',
    description: 'Male in 6 verschiedenen Parks',
    category: 'Location',
    rarity: 'COMMON',
    icon: 'Trees',
    requirement: { type: 'count', value: 6, metric: 'parks_painted' },
    rewards: { exp: 150, money: 130, reputation: 35 }
  },
  {
    id: 'industriegebiet',
    name: 'Industriegebiet',
    description: 'Male 20 Pieces in Industriegebieten',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'Factory',
    requirement: { type: 'count', value: 20, metric: 'industrial_pieces' },
    rewards: { exp: 260, money: 225, reputation: 54 }
  },
  {
    id: 'waterfront',
    name: 'Waterfront',
    description: 'Male an 10 Orten am Wasser',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'Waves',
    requirement: { type: 'count', value: 10, metric: 'waterfront_spots' },
    rewards: { exp: 210, money: 180, reputation: 46 }
  },
  {
    id: 'dach_konig',
    name: 'Dach-König',
    description: 'Male auf 25 verschiedenen Dächern',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Home',
    requirement: { type: 'count', value: 25, metric: 'rooftops_painted' },
    rewards: { exp: 360, money: 315, reputation: 72 }
  },
  {
    id: 'keller_kunst',
    name: 'Keller-Kunst',
    description: 'Male in 8 Kellern oder Unterführungen',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'ArrowDown',
    requirement: { type: 'count', value: 8, metric: 'basement_pieces' },
    rewards: { exp: 190, money: 165, reputation: 43 }
  },
  {
    id: 'schulhof_rebel',
    name: 'Schulhof-Rebel',
    description: 'Male in 5 Schulgebieten',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'GraduationCap',
    requirement: { type: 'count', value: 5, metric: 'school_pieces' },
    rewards: { exp: 230, money: 200, reputation: 49 }
  },
  {
    id: 'stadion_bomber',
    name: 'Stadion-Bomber',
    description: 'Male in 3 Stadien',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Stadium',
    requirement: { type: 'count', value: 3, metric: 'stadium_pieces' },
    rewards: { exp: 340, money: 295, reputation: 69 }
  },
  {
    id: 'hauptstrasse_held',
    name: 'Hauptstraße-Held',
    description: 'Male 15 Pieces an Hauptstraßen',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'Route',
    requirement: { type: 'count', value: 15, metric: 'main_street_pieces' },
    rewards: { exp: 250, money: 215, reputation: 53 }
  },
  {
    id: 'gassen_artist',
    name: 'Gassen-Artist',
    description: 'Male in 30 Hintergassen',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'CornerRightDown',
    requirement: { type: 'count', value: 30, metric: 'alley_pieces' },
    rewards: { exp: 280, money: 240, reputation: 56 }
  },
  {
    id: 'parkhaus_pro',
    name: 'Parkhaus-Pro',
    description: 'Male in 10 Parkhäusern',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'ParkingCircle',
    requirement: { type: 'count', value: 10, metric: 'parking_pieces' },
    rewards: { exp: 200, money: 175, reputation: 44 }
  },
  {
    id: 'kirchen_kunst',
    name: 'Kirchen-Kunst',
    description: 'Male in der Nähe von 3 Kirchen',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Church',
    requirement: { type: 'count', value: 3, metric: 'church_pieces' },
    rewards: { exp: 310, money: 270, reputation: 63 }
  },
  {
    id: 'buro_bomber',
    name: 'Büro-Bomber',
    description: 'Male in 8 Bürogebäuden',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Briefcase',
    requirement: { type: 'count', value: 8, metric: 'office_pieces' },
    rewards: { exp: 290, money: 250, reputation: 58 }
  },
  {
    id: 'marktplatz_meister',
    name: 'Marktplatz-Meister',
    description: 'Male auf 5 Marktplätzen',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'ShoppingCart',
    requirement: { type: 'count', value: 5, metric: 'market_pieces' },
    rewards: { exp: 180, money: 155, reputation: 41 }
  },
  {
    id: 'shopping_zone',
    name: 'Shopping Zone',
    description: 'Male in 12 Einkaufszentren',
    category: 'Location',
    rarity: 'RARE',
    icon: 'ShoppingBag',
    requirement: { type: 'count', value: 12, metric: 'mall_pieces' },
    rewards: { exp: 330, money: 290, reputation: 68 }
  },
  {
    id: 'krankenhaus_kunst',
    name: 'Krankenhaus-Kunst',
    description: 'Male in der Nähe von 3 Krankenhäusern',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Hospital',
    requirement: { type: 'count', value: 3, metric: 'hospital_pieces' },
    rewards: { exp: 300, money: 265, reputation: 61 }
  },
  {
    id: 'flughafen_artist',
    name: 'Flughafen-Artist',
    description: 'Male am Flughafen',
    category: 'Location',
    rarity: 'EPIC',
    icon: 'Plane',
    requirement: { type: 'count', value: 1, metric: 'airport_pieces' },
    rewards: { exp: 500, money: 450, reputation: 100 }
  },
  {
    id: 'hafen_held',
    name: 'Hafen-Held',
    description: 'Male in Hafengebieten 10x',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Anchor',
    requirement: { type: 'count', value: 10, metric: 'harbor_pieces' },
    rewards: { exp: 320, money: 280, reputation: 66 }
  },
  {
    id: 'uni_underground',
    name: 'Uni Underground',
    description: 'Male in 5 Universitätsgebieten',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'BookOpen',
    requirement: { type: 'count', value: 5, metric: 'university_pieces' },
    rewards: { exp: 240, money: 210, reputation: 52 }
  },
  {
    id: 'museum_mission',
    name: 'Museum Mission',
    description: 'Male in der Nähe eines Museums',
    category: 'Location',
    rarity: 'EPIC',
    icon: 'Landmark',
    requirement: { type: 'count', value: 1, metric: 'museum_pieces' },
    rewards: { exp: 450, money: 400, reputation: 90 }
  },
  {
    id: 'bahnhof_boss',
    name: 'Bahnhof-Boss',
    description: 'Male in 15 verschiedenen Bahnhöfen',
    category: 'Location',
    rarity: 'RARE',
    icon: 'MapPin',
    requirement: { type: 'count', value: 15, metric: 'unique_stations' },
    rewards: { exp: 370, money: 325, reputation: 74 }
  },
  {
    id: 'geheime_spots',
    name: 'Geheime Spots',
    description: 'Finde und male 20 versteckte Locations',
    category: 'Location',
    rarity: 'EPIC',
    icon: 'Search',
    requirement: { type: 'count', value: 20, metric: 'secret_spots' },
    rewards: { exp: 520, money: 470, reputation: 105 }
  },
  {
    id: 'city_completionist',
    name: 'City Completionist',
    description: 'Male in allen verfügbaren Stadtteilen',
    category: 'Location',
    rarity: 'LEGENDARY',
    icon: 'Map',
    requirement: { type: 'condition', value: 1, condition: 'all_districts' },
    rewards: { exp: 1000, money: 900, reputation: 200, unlocks: ['city_master_badge'] }
  },
  {
    id: 'tourist_spots',
    name: 'Tourist Spots',
    description: 'Male an 10 touristischen Orten',
    category: 'Location',
    rarity: 'RARE',
    icon: 'Camera',
    requirement: { type: 'count', value: 10, metric: 'tourist_pieces' },
    rewards: { exp: 350, money: 305, reputation: 71 }
  },
  {
    id: 'wohngebiet_wanderer',
    name: 'Wohngebiet-Wanderer',
    description: 'Male in 25 Wohngebieten',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'Home',
    requirement: { type: 'count', value: 25, metric: 'residential_pieces' },
    rewards: { exp: 270, money: 235, reputation: 55 }
  },
  {
    id: 'construction_artist',
    name: 'Construction Artist',
    description: 'Male auf 15 Baustellen',
    category: 'Location',
    rarity: 'UNCOMMON',
    icon: 'HardHat',
    requirement: { type: 'count', value: 15, metric: 'construction_pieces' },
    rewards: { exp: 230, money: 200, reputation: 50 }
  },
  {
    id: 'landmark_legend',
    name: 'Landmark Legend',
    description: 'Male an allen wichtigen Wahrzeichen',
    category: 'Location',
    rarity: 'LEGENDARY',
    icon: 'Award',
    requirement: { type: 'condition', value: 1, condition: 'all_landmarks' },
    rewards: { exp: 1200, money: 1100, reputation: 250, unlocks: ['landmark_spray'] }
  },
  {
    id: 'urban_explorer',
    name: 'Urban Explorer',
    description: 'Male in 100 verschiedenen Locations',
    category: 'Location',
    rarity: 'EPIC',
    icon: 'Compass',
    requirement: { type: 'count', value: 100, metric: 'unique_locations' },
    rewards: { exp: 600, money: 550, reputation: 120 }
  },
  {
    id: 'forbidden_zones',
    name: 'Forbidden Zones',
    description: 'Male in 5 verbotenen Bereichen',
    category: 'Location',
    rarity: 'EPIC',
    icon: 'ShieldAlert',
    requirement: { type: 'count', value: 5, metric: 'forbidden_pieces' },
    rewards: { exp: 550, money: 500, reputation: 110 }
  },
  {
    id: 'weltreisender',
    name: 'Weltreisender',
    description: 'Male in 3 verschiedenen Städten',
    category: 'Location',
    rarity: 'LEGENDARY',
    icon: 'Globe',
    requirement: { type: 'count', value: 3, metric: 'unique_cities' },
    rewards: { exp: 1500, money: 1300, reputation: 300, unlocks: ['world_traveler_colors'] }
  },

  // PRESTIGE CATEGORY (25)
  {
    id: 'legend_status',
    name: 'Legend Status',
    description: 'Erreiche 10.000 Fame',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Crown',
    requirement: { type: 'threshold', value: 10000, metric: 'fame' },
    rewards: { exp: 1500, money: 1300, reputation: 300, unlocks: ['legend_title'] }
  },
  {
    id: 'millionar',
    name: 'Millionär',
    description: 'Verdiene insgesamt 1.000.000€',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'DollarSign',
    requirement: { type: 'threshold', value: 1000000, metric: 'total_money_earned' },
    rewards: { exp: 2000, money: 1500, reputation: 400, unlocks: ['gold_spray'] }
  },
  {
    id: 'fame_konig',
    name: 'Fame-König',
    description: 'Erreiche 5.000 Fame',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Star',
    requirement: { type: 'threshold', value: 5000, metric: 'fame' },
    rewards: { exp: 800, money: 700, reputation: 150 }
  },
  {
    id: 'reputation_boss',
    name: 'Reputation-Boss',
    description: 'Erreiche 500 Reputation',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'TrendingUp',
    requirement: { type: 'threshold', value: 500, metric: 'reputation' },
    rewards: { exp: 700, money: 600, reputation: 120 }
  },
  {
    id: 'piece_meister',
    name: 'Piece-Meister',
    description: 'Vervollständige 500 Pieces',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Target',
    requirement: { type: 'count', value: 500, metric: 'pieces_completed' },
    rewards: { exp: 1800, money: 1400, reputation: 350, unlocks: ['master_tools'] }
  },
  {
    id: 'quality_guru',
    name: 'Quality Guru',
    description: 'Erreiche durchschnittlich 85% Qualität über 100 Pieces',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Award',
    requirement: { type: 'threshold', value: 85, metric: 'average_quality' },
    rewards: { exp: 900, money: 800, reputation: 180 }
  },
  {
    id: 'perfektionist',
    name: 'Perfektionist',
    description: 'Erreiche 99% Qualität bei einem Piece',
    category: 'Prestige',
    rarity: 'MYTHIC',
    icon: 'Gem',
    requirement: { type: 'threshold', value: 99, metric: 'best_quality' },
    rewards: { exp: 2500, money: 2000, reputation: 500, unlocks: ['perfect_spray'], boosts: [{ type: 'quality', value: 10, duration: 3600 }] }
  },
  {
    id: 'crew_legende',
    name: 'Crew-Legende',
    description: 'Erreiche Top-Rank in deiner Crew',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Users',
    requirement: { type: 'condition', value: 1, condition: 'crew_top_rank' },
    rewards: { exp: 1000, money: 900, reputation: 200 }
  },
  {
    id: 'unaufhaltsam',
    name: 'Unaufhaltsam',
    description: 'Male 50 Pieces hintereinander mit 80%+ Qualität',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Zap',
    requirement: { type: 'count', value: 50, metric: 'quality_streak' },
    rewards: { exp: 1600, money: 1200, reputation: 320, boosts: [{ type: 'exp', value: 50, duration: 7200 }] }
  },
  {
    id: 'speed_legende',
    name: 'Speed-Legende',
    description: 'Vervollständige 100 Pieces in unter 2 Minuten',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Rocket',
    requirement: { type: 'count', value: 100, metric: 'speed_pieces' },
    rewards: { exp: 950, money: 850, reputation: 190 }
  },
  {
    id: 'nacht_konig',
    name: 'Nacht-König',
    description: 'Male 200 Pieces nachts',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Moon',
    requirement: { type: 'count', value: 200, metric: 'night_pieces' },
    rewards: { exp: 850, money: 750, reputation: 170 }
  },
  {
    id: 'tag_konig',
    name: 'Tag-König',
    description: 'Vervollständige 300 Tags',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Type',
    requirement: { type: 'count', value: 300, metric: 'tags_completed' },
    rewards: { exp: 800, money: 700, reputation: 160 }
  },
  {
    id: 'geld_magnat',
    name: 'Geld-Magnat',
    description: 'Besitze 100.000€ gleichzeitig',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Coins',
    requirement: { type: 'threshold', value: 100000, metric: 'current_money' },
    rewards: { exp: 1400, money: 1000, reputation: 280 }
  },
  {
    id: 'spot_eroberer',
    name: 'Spot-Eroberer',
    description: 'Male 200 verschiedene Spots',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'MapPin',
    requirement: { type: 'count', value: 200, metric: 'unique_spots' },
    rewards: { exp: 1100, money: 1000, reputation: 220 }
  },
  {
    id: 'farb_sammler_pro',
    name: 'Farb-Sammler Pro',
    description: 'Besitze alle verfügbaren Farben',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Palette',
    requirement: { type: 'condition', value: 1, condition: 'all_colors' },
    rewards: { exp: 750, money: 650, reputation: 150 }
  },
  {
    id: 'tool_meister',
    name: 'Tool-Meister',
    description: 'Besitze alle verfügbaren Tools',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Wrench',
    requirement: { type: 'condition', value: 1, condition: 'all_tools' },
    rewards: { exp: 700, money: 600, reputation: 140 }
  },
  {
    id: 'marathon_maler',
    name: 'Marathon-Maler',
    description: 'Male 30 Tage hintereinander',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Calendar',
    requirement: { type: 'count', value: 30, metric: 'consecutive_days' },
    rewards: { exp: 1700, money: 1300, reputation: 340, boosts: [{ type: 'money', value: 25, duration: 86400 }] }
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Spiele 100 Stunden',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Clock',
    requirement: { type: 'threshold', value: 360000, metric: 'play_time' },
    rewards: { exp: 1000, money: 900, reputation: 200 }
  },
  {
    id: 'achievement_jager',
    name: 'Achievement-Jäger',
    description: 'Schalte 100 Achievements frei',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Trophy',
    requirement: { type: 'count', value: 100, metric: 'achievements_unlocked' },
    rewards: { exp: 2000, money: 1500, reputation: 400, unlocks: ['platinum_spray'] }
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Bekomme 1000 Likes auf deinen Pieces',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Heart',
    requirement: { type: 'threshold', value: 1000, metric: 'total_likes' },
    rewards: { exp: 850, money: 750, reputation: 170 }
  },
  {
    id: 'viral_artist',
    name: 'Viral Artist',
    description: 'Bekomme 5000 Views auf einem Piece',
    category: 'Prestige',
    rarity: 'EPIC',
    icon: 'Eye',
    requirement: { type: 'threshold', value: 5000, metric: 'max_views' },
    rewards: { exp: 900, money: 800, reputation: 180 }
  },
  {
    id: 'hall_of_fame',
    name: 'Hall of Fame',
    description: 'Komm in die Top 10 der Bestenliste',
    category: 'Prestige',
    rarity: 'LEGENDARY',
    icon: 'Medal',
    requirement: { type: 'condition', value: 1, condition: 'top_10_leaderboard' },
    rewards: { exp: 2500, money: 2000, reputation: 500, unlocks: ['hall_of_fame_badge'] }
  },
  {
    id: 'weltklasse',
    name: 'Weltklasse',
    description: 'Erreiche Rang 1 in der Weltrangliste',
    category: 'Prestige',
    rarity: 'MYTHIC',
    icon: 'Crown',
    requirement: { type: 'condition', value: 1, condition: 'world_rank_1' },
    rewards: { exp: 5000, money: 4000, reputation: 1000, unlocks: ['world_champion_spray'], boosts: [{ type: 'all', value: 25, duration: 604800 }] }
  },
  {
    id: 'ewiger_ruhm',
    name: 'Ewiger Ruhm',
    description: 'Erreiche 20.000 Fame',
    category: 'Prestige',
    rarity: 'MYTHIC',
    icon: 'Sparkles',
    requirement: { type: 'threshold', value: 20000, metric: 'fame' },
    rewards: { exp: 3000, money: 2500, reputation: 600, unlocks: ['eternal_spray'] }
  },
  {
    id: 'komplettionist',
    name: 'Komplettionist',
    description: 'Schalte alle Achievements frei',
    category: 'Prestige',
    rarity: 'MYTHIC',
    icon: 'Award',
    requirement: { type: 'condition', value: 1, condition: 'all_achievements' },
    rewards: { exp: 10000, money: 10000, reputation: 2000, unlocks: ['completionist_spray', 'rainbow_effect'], boosts: [{ type: 'all', value: 100 }] }
  },

  // SPEED CATEGORY (20)
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Vervollständige ein Piece in unter 60 Sekunden',
    category: 'Speed',
    rarity: 'RARE',
    icon: 'Zap',
    requirement: { type: 'threshold', value: 60, metric: 'fastest_piece' },
    rewards: { exp: 300, money: 260, reputation: 60 }
  },
  {
    id: 'blitz_bomber',
    name: 'Blitz-Bomber',
    description: 'Male 3 Pieces in 10 Minuten',
    category: 'Speed',
    rarity: 'RARE',
    icon: 'Timer',
    requirement: { type: 'count', value: 3, metric: 'pieces_10min' },
    rewards: { exp: 350, money: 300, reputation: 70 }
  },
  {
    id: 'schnell_zeichner',
    name: 'Schnell-Zeichner',
    description: 'Vervollständige 25 Pieces in unter 2 Minuten',
    category: 'Speed',
    rarity: 'UNCOMMON',
    icon: 'Clock',
    requirement: { type: 'count', value: 25, metric: 'fast_pieces' },
    rewards: { exp: 250, money: 215, reputation: 53 }
  },
  {
    id: 'tag_sprinter',
    name: 'Tag-Sprinter',
    description: 'Vervollständige 10 Tags in unter 30 Sekunden',
    category: 'Speed',
    rarity: 'UNCOMMON',
    icon: 'Gauge',
    requirement: { type: 'count', value: 10, metric: 'sprint_tags' },
    rewards: { exp: 200, money: 175, reputation: 44 }
  },
  {
    id: 'throwup_tempo',
    name: 'Throwup-Tempo',
    description: 'Male 5 Throwups in unter 90 Sekunden',
    category: 'Speed',
    rarity: 'RARE',
    icon: 'FastForward',
    requirement: { type: 'count', value: 5, metric: 'fast_throwups' },
    rewards: { exp: 280, money: 240, reputation: 56 }
  },
  {
    id: 'rekord_brecher',
    name: 'Rekord-Brecher',
    description: 'Vervollständige ein Piece in unter 45 Sekunden',
    category: 'Speed',
    rarity: 'EPIC',
    icon: 'Trophy',
    requirement: { type: 'threshold', value: 45, metric: 'fastest_piece' },
    rewards: { exp: 450, money: 400, reputation: 90 }
  },
  {
    id: 'express_artist',
    name: 'Express-Artist',
    description: 'Male 50 Pieces in unter 90 Sekunden',
    category: 'Speed',
    rarity: 'RARE',
    icon: 'Rocket',
    requirement: { type: 'count', value: 50, metric: 'express_pieces' },
    rewards: { exp: 380, money: 330, reputation: 75 }
  },
  {
    id: 'stundenrekord',
    name: 'Stundenrekord',
    description: 'Vervollständige 20 Pieces in einer Stunde',
    category: 'Speed',
    rarity: 'EPIC',
    icon: 'Clock3',
    requirement: { type: 'count', value: 20, metric: 'pieces_one_hour' },
    rewards: { exp: 500, money: 450, reputation: 100 }
  },
  {
    id: 'flash_fingers',
    name: 'Flash Fingers',
    description: 'Zeichne 1000 Linien in unter 60 Sekunden',
    category: 'Speed',
    rarity: 'UNCOMMON',
    icon: 'Hand',
    requirement: { type: 'threshold', value: 1000, metric: 'lines_per_minute' },
    rewards: { exp: 220, money: 190, reputation: 48 }
  },
  {
    id: 'geschwindigkeits_konig',
    name: 'Geschwindigkeits-König',
    description: 'Halte 10 Speed-Rekorde gleichzeitig',
    category: 'Speed',
    rarity: 'LEGENDARY',
    icon: 'Crown',
    requirement: { type: 'count', value: 10, metric: 'speed_records' },
    rewards: { exp: 1000, money: 900, reputation: 200, unlocks: ['speed_boost_permanent'] }
  },
  {
    id: 'tag_marathon',
    name: 'Tag-Marathon',
    description: 'Vervollständige 50 Tags in 30 Minuten',
    category: 'Speed',
    rarity: 'RARE',
    icon: 'Activity',
    requirement: { type: 'count', value: 50, metric: 'tags_30min' },
    rewards: { exp: 360, money: 315, reputation: 72 }
  },
  {
    id: 'turbo_modus',
    name: 'Turbo-Modus',
    description: 'Erreiche 95% Speed-Rating in 10 Pieces',
    category: 'Speed',
    rarity: 'RARE',
    icon: 'Gauge',
    requirement: { type: 'count', value: 10, metric: 'turbo_pieces' },
    rewards: { exp: 340, money: 295, reputation: 69 }
  },
  {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Vervollständige ein Piece in unter 30 Sekunden',
    category: 'Speed',
    rarity: 'EPIC',
    icon: 'Zap',
    requirement: { type: 'threshold', value: 30, metric: 'fastest_piece' },
    rewards: { exp: 550, money: 500, reputation: 110 }
  },
  {
    id: 'speed_qualitat',
    name: 'Speed & Qualität',
    description: 'Erreiche 90% Qualität in unter 60 Sekunden',
    category: 'Speed',
    rarity: 'EPIC',
    icon: 'Award',
    requirement: { type: 'count', value: 1, metric: 'speed_quality_combo' },
    rewards: { exp: 600, money: 550, reputation: 120 }
  },
  {
    id: 'no_pause',
    name: 'No Pause',
    description: 'Male 5 Pieces hintereinander ohne Pause',
    category: 'Speed',
    rarity: 'UNCOMMON',
    icon: 'Play',
    requirement: { type: 'count', value: 5, metric: 'no_pause_streak' },
    rewards: { exp: 230, money: 200, reputation: 49 }
  },
  {
    id: 'morgen_rush',
    name: 'Morgen-Rush',
    description: 'Male 10 Pieces zwischen 6-8 Uhr morgens',
    category: 'Speed',
    rarity: 'UNCOMMON',
    icon: 'Sunrise',
    requirement: { type: 'count', value: 10, metric: 'morning_pieces' },
    rewards: { exp: 210, money: 180, reputation: 46 }
  },
  {
    id: 'tages_sprint',
    name: 'Tages-Sprint',
    description: 'Vervollständige 30 Pieces an einem Tag',
    category: 'Speed',
    rarity: 'EPIC',
    icon: 'CalendarDays',
    requirement: { type: 'count', value: 30, metric: 'pieces_one_day' },
    rewards: { exp: 520, money: 470, reputation: 105 }
  },
  {
    id: 'schnellster_finger',
    name: 'Schnellster Finger',
    description: 'Erreiche Top 10 in Speed-Rangliste',
    category: 'Speed',
    rarity: 'LEGENDARY',
    icon: 'Medal',
    requirement: { type: 'condition', value: 1, condition: 'speed_top_10' },
    rewards: { exp: 1200, money: 1100, reputation: 250, unlocks: ['speed_legend_title'] }
  },
  {
    id: 'geschwindigkeits_wahn',
    name: 'Geschwindigkeits-Wahn',
    description: 'Vervollständige 100 Pieces in unter 2 Minuten',
    category: 'Speed',
    rarity: 'LEGENDARY',
    icon: 'Rocket',
    requirement: { type: 'count', value: 100, metric: 'speed_pieces' },
    rewards: { exp: 1500, money: 1300, reputation: 300, boosts: [{ type: 'speed', value: 50, duration: 86400 }] }
  },
  {
    id: 'ultimativer_speed',
    name: 'Ultimativer Speed',
    description: 'Vervollständige ein perfektes Piece in unter 60 Sekunden',
    category: 'Speed',
    rarity: 'MYTHIC',
    icon: 'Sparkles',
    requirement: { type: 'condition', value: 1, condition: 'perfect_speed_combo' },
    rewards: { exp: 2500, money: 2000, reputation: 500, unlocks: ['ultimate_speed_spray'], boosts: [{ type: 'all', value: 50, duration: 172800 }] }
  },

  // SPECIAL CATEGORY (35)
  {
    id: 'secret_spot',
    name: 'Secret Spot',
    description: 'Finde den geheimen Entwickler-Spot',
    category: 'Special',
    rarity: 'MYTHIC',
    icon: 'KeyRound',
    requirement: { type: 'condition', value: 1, condition: 'dev_spot' },
    rewards: { exp: 5000, money: 5000, reputation: 1000, unlocks: ['developer_spray'] }
  },
  {
    id: 'easter_egg',
    name: 'Easter Egg',
    description: 'Finde ein verstecktes Easter Egg',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Egg',
    requirement: { type: 'condition', value: 1, condition: 'easter_egg' },
    rewards: { exp: 300, money: 250, reputation: 60 }
  },
  {
    id: 'regenbogen_piece',
    name: 'Regenbogen-Piece',
    description: 'Benutze alle Regenbogenfarben in einem Piece',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Rainbow',
    requirement: { type: 'condition', value: 1, condition: 'rainbow_piece' },
    rewards: { exp: 200, money: 175, reputation: 45 }
  },
  {
    id: 'geburtstags_piece',
    name: 'Geburtstags-Piece',
    description: 'Male an deinem Geburtstag',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Cake',
    requirement: { type: 'condition', value: 1, condition: 'birthday_piece' },
    rewards: { exp: 500, money: 500, reputation: 100, boosts: [{ type: 'exp', value: 100, duration: 86400 }] }
  },
  {
    id: 'silvester_bomber',
    name: 'Silvester-Bomber',
    description: 'Male am Silvesterabend',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Sparkles',
    requirement: { type: 'condition', value: 1, condition: 'new_year_piece' },
    rewards: { exp: 400, money: 400, reputation: 80 }
  },
  {
    id: 'weihnachts_kunst',
    name: 'Weihnachts-Kunst',
    description: 'Male an Weihnachten',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Gift',
    requirement: { type: 'condition', value: 1, condition: 'christmas_piece' },
    rewards: { exp: 350, money: 350, reputation: 70 }
  },
  {
    id: 'halloween_horror',
    name: 'Halloween-Horror',
    description: 'Male an Halloween',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Ghost',
    requirement: { type: 'condition', value: 1, condition: 'halloween_piece' },
    rewards: { exp: 330, money: 330, reputation: 66 }
  },
  {
    id: 'valentins_artist',
    name: 'Valentins-Artist',
    description: 'Male am Valentinstag',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Heart',
    requirement: { type: 'condition', value: 1, condition: 'valentine_piece' },
    rewards: { exp: 250, money: 250, reputation: 50 }
  },
  {
    id: 'mitternachts_maler',
    name: 'Mitternachts-Maler',
    description: 'Male genau um Mitternacht',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Clock12',
    requirement: { type: 'condition', value: 1, condition: 'midnight_piece' },
    rewards: { exp: 220, money: 200, reputation: 48 }
  },
  {
    id: 'sonnenaufgang_session',
    name: 'Sonnenaufgang-Session',
    description: 'Male bei Sonnenaufgang',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Sunrise',
    requirement: { type: 'count', value: 5, metric: 'sunrise_pieces' },
    rewards: { exp: 240, money: 210, reputation: 52 }
  },
  {
    id: 'sonnenuntergang_style',
    name: 'Sonnenuntergang-Style',
    description: 'Male bei Sonnenuntergang',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Sunset',
    requirement: { type: 'count', value: 5, metric: 'sunset_pieces' },
    rewards: { exp: 230, money: 200, reputation: 50 }
  },
  {
    id: 'regen_rebel',
    name: 'Regen-Rebel',
    description: 'Male bei Regen',
    category: 'Special',
    rarity: 'RARE',
    icon: 'CloudRain',
    requirement: { type: 'count', value: 10, metric: 'rain_pieces' },
    rewards: { exp: 310, money: 270, reputation: 63 }
  },
  {
    id: 'schnee_artist',
    name: 'Schnee-Artist',
    description: 'Male bei Schnee',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Snowflake',
    requirement: { type: 'count', value: 5, metric: 'snow_pieces' },
    rewards: { exp: 340, money: 295, reputation: 69 }
  },
  {
    id: 'gewitter_wahnsinn',
    name: 'Gewitter-Wahnsinn',
    description: 'Male während eines Gewitters',
    category: 'Special',
    rarity: 'EPIC',
    icon: 'CloudLightning',
    requirement: { type: 'count', value: 3, metric: 'storm_pieces' },
    rewards: { exp: 500, money: 450, reputation: 100 }
  },
  {
    id: 'vier_jahreszeiten',
    name: 'Vier Jahreszeiten',
    description: 'Male in allen 4 Jahreszeiten',
    category: 'Special',
    rarity: 'EPIC',
    icon: 'Calendar',
    requirement: { type: 'condition', value: 1, condition: 'all_seasons' },
    rewards: { exp: 600, money: 550, reputation: 120 }
  },
  {
    id: 'crew_gründer',
    name: 'Crew-Gründer',
    description: 'Gründe deine eigene Crew',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Users',
    requirement: { type: 'condition', value: 1, condition: 'founded_crew' },
    rewards: { exp: 400, money: 350, reputation: 80 }
  },
  {
    id: 'crew_rekrut',
    name: 'Crew-Rekrut',
    description: 'Rekrutiere 10 Crew-Mitglieder',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'UserPlus',
    requirement: { type: 'count', value: 10, metric: 'crew_recruited' },
    rewards: { exp: 280, money: 240, reputation: 56 }
  },
  {
    id: 'solo_artist',
    name: 'Solo-Artist',
    description: 'Vervollständige 100 Pieces ohne Crew',
    category: 'Special',
    rarity: 'RARE',
    icon: 'User',
    requirement: { type: 'count', value: 100, metric: 'solo_pieces' },
    rewards: { exp: 350, money: 305, reputation: 71 }
  },
  {
    id: 'kollaboration',
    name: 'Kollaboration',
    description: 'Male mit 5 verschiedenen Artists zusammen',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Users2',
    requirement: { type: 'count', value: 5, metric: 'unique_collabs' },
    rewards: { exp: 260, money: 225, reputation: 54 }
  },
  {
    id: 'battle_gewinner',
    name: 'Battle-Gewinner',
    description: 'Gewinne 10 Graffiti-Battles',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Swords',
    requirement: { type: 'count', value: 10, metric: 'battles_won' },
    rewards: { exp: 380, money: 330, reputation: 75 }
  },
  {
    id: 'battle_champion',
    name: 'Battle-Champion',
    description: 'Gewinne 50 Graffiti-Battles',
    category: 'Special',
    rarity: 'EPIC',
    icon: 'Trophy',
    requirement: { type: 'count', value: 50, metric: 'battles_won' },
    rewards: { exp: 700, money: 650, reputation: 140, unlocks: ['battle_champion_title'] }
  },
  {
    id: 'fotograf',
    name: 'Fotograf',
    description: 'Mache 100 Screenshots von Pieces',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Camera',
    requirement: { type: 'count', value: 100, metric: 'screenshots_taken' },
    rewards: { exp: 200, money: 175, reputation: 44 }
  },
  {
    id: 'like_magnet',
    name: 'Like-Magnet',
    description: 'Bekomme 100 Likes auf einem Piece',
    category: 'Special',
    rarity: 'RARE',
    icon: 'ThumbsUp',
    requirement: { type: 'threshold', value: 100, metric: 'max_likes' },
    rewards: { exp: 300, money: 265, reputation: 61 }
  },
  {
    id: 'community_held',
    name: 'Community-Held',
    description: 'Hilf 25 anderen Spielern',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'HandHeart',
    requirement: { type: 'count', value: 25, metric: 'players_helped' },
    rewards: { exp: 270, money: 235, reputation: 55 }
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Trainiere 10 Anfänger',
    category: 'Special',
    rarity: 'RARE',
    icon: 'GraduationCap',
    requirement: { type: 'count', value: 10, metric: 'players_trained' },
    rewards: { exp: 400, money: 350, reputation: 80 }
  },
  {
    id: 'streamer',
    name: 'Streamer',
    description: 'Streame deine Session 10x',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Video',
    requirement: { type: 'count', value: 10, metric: 'streams' },
    rewards: { exp: 250, money: 220, reputation: 52 }
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Melde 5 Bugs',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'Bug',
    requirement: { type: 'count', value: 5, metric: 'bugs_reported' },
    rewards: { exp: 200, money: 180, reputation: 45 }
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Teste neue Features vor Release',
    category: 'Special',
    rarity: 'RARE',
    icon: 'FlaskConical',
    requirement: { type: 'condition', value: 1, condition: 'beta_tester' },
    rewards: { exp: 500, money: 450, reputation: 100, unlocks: ['beta_spray'] }
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Spiele in der ersten Woche nach Release',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Clock',
    requirement: { type: 'condition', value: 1, condition: 'early_player' },
    rewards: { exp: 300, money: 250, reputation: 60, unlocks: ['early_adopter_badge'] }
  },
  {
    id: 'tag_meister_challenge',
    name: 'Tag-Meister Challenge',
    description: 'Vervollständige alle Tag-Challenges',
    category: 'Special',
    rarity: 'EPIC',
    icon: 'CheckSquare',
    requirement: { type: 'condition', value: 1, condition: 'all_tag_challenges' },
    rewards: { exp: 800, money: 750, reputation: 160 }
  },
  {
    id: 'spenden_held',
    name: 'Spenden-Held',
    description: 'Spende 10.000€ an andere Spieler',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Gift',
    requirement: { type: 'threshold', value: 10000, metric: 'money_donated' },
    rewards: { exp: 400, money: 0, reputation: 150 }
  },
  {
    id: 'handel_konig',
    name: 'Handel-König',
    description: 'Tausche 50x mit anderen Spielern',
    category: 'Special',
    rarity: 'UNCOMMON',
    icon: 'ArrowLeftRight',
    requirement: { type: 'count', value: 50, metric: 'trades_completed' },
    rewards: { exp: 280, money: 245, reputation: 58 }
  },
  {
    id: 'customization_king',
    name: 'Customization King',
    description: 'Erstelle 20 custom Designs',
    category: 'Special',
    rarity: 'RARE',
    icon: 'Paintbrush',
    requirement: { type: 'count', value: 20, metric: 'custom_designs' },
    rewards: { exp: 350, money: 310, reputation: 72 }
  },
  {
    id: 'perfekte_woche',
    name: 'Perfekte Woche',
    description: 'Male 7 Tage perfekte Pieces',
    category: 'Special',
    rarity: 'LEGENDARY',
    icon: 'CalendarCheck',
    requirement: { type: 'count', value: 7, metric: 'perfect_week' },
    rewards: { exp: 1500, money: 1300, reputation: 300, boosts: [{ type: 'quality', value: 25, duration: 604800 }] }
  },
  {
    id: 'ewige_legende',
    name: 'Ewige Legende',
    description: 'Erreiche alle anderen Achievements',
    category: 'Special',
    rarity: 'MYTHIC',
    icon: 'Infinity',
    requirement: { type: 'condition', value: 1, condition: 'all_other_achievements' },
    rewards: { exp: 25000, money: 25000, reputation: 5000, unlocks: ['mythic_spray', 'eternal_glow'], boosts: [{ type: 'all', value: 200 }] }
  },
];

export default achievements;
