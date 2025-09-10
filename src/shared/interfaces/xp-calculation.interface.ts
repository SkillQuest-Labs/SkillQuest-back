export interface XpCalculationResult {
  xpGained: number;
  newLevel: number;
  levelUp: boolean;
  xpToNextLevel: number;
}

export interface SessionValidationData {
  duration: number;
  questsCompleted: number;
  userLevel: number;
  currentXp: number;
  questXpValues: number[];
}
