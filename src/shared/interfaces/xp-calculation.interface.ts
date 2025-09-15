export interface QuestXpData {
  questId: string;
  baseXp: number;
  isCompleted: boolean;
  xpGained: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface XpCalculationResult {
  xpGained: number;
  newLevel: number;
  levelUp: boolean;
  xpToNextLevel: number;
  questXpData: QuestXpData[];
}

export interface SessionValidationData {
  duration: number;
  questsCompleted: number;
  userLevel: number;
  currentXp: number;
  quests: {
    id: string;
    baseXp: number;
    isCompleted: boolean;
  }[];
}
