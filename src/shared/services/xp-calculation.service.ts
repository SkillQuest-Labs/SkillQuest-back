import { Injectable } from '@nestjs/common';
import { XpCalculationResult, SessionValidationData, QuestXpData } from '../interfaces/xp-calculation.interface';

@Injectable()
export class XpCalculationService {
  private readonly BASE_XP = 100;
  private readonly QUEST_BONUS_MULTIPLIER = 1.1;
  private readonly MIN_SESSION_DURATION = 15;

  calculateSessionXp(data: SessionValidationData): XpCalculationResult {
    const { duration, questsCompleted, userLevel, currentXp, quests } = data;

    if (duration < this.MIN_SESSION_DURATION) {
      return {
        xpGained: 0,
        newLevel: userLevel,
        levelUp: false,
        xpToNextLevel: this.calculateXpToNextLevel(currentXp, userLevel),
        questXpData: [],
      };
    }

    const durationXp = (duration / 60) * 10;
    
    const questXpData: QuestXpData[] = quests.map(quest => {
      const baseXp = quest.baseXp || 10;
      const isCompleted = quest.isCompleted;
      
      let xpGained: number;
      let status: 'IN_PROGRESS' | 'COMPLETED';
      
      if (isCompleted) {
        const bonus = Math.floor(baseXp * 0.5);
        xpGained = baseXp + bonus;
        status = 'COMPLETED';
      } else {
        xpGained = baseXp;
        status = 'IN_PROGRESS';
      }
      
      return {
        questId: quest.id,
        baseXp,
        isCompleted,
        xpGained,
        status,
      };
    });
    
    const totalQuestXp = questXpData.reduce((sum, quest) => sum + quest.xpGained, 0);
    
    const questBonus = 1 + (questsCompleted * this.QUEST_BONUS_MULTIPLIER);
    
    const xpGained = Math.floor(
      (durationXp + totalQuestXp) * questBonus
    );

    const newTotalXp = currentXp + xpGained;
    const newLevel = this.calculateLevelFromXp(newTotalXp);
    const levelUp = newLevel > userLevel;
    
    const xpToNextLevel = this.calculateXpToNextLevel(newTotalXp, newLevel);

    return {
      xpGained,
      newLevel,
      levelUp,
      xpToNextLevel,
      questXpData,
    };
  }

  private calculateLevelFromXp(totalXp: number): number {
    return Math.floor(Math.sqrt(totalXp / this.BASE_XP)) + 1;
  }

  private calculateXpToNextLevel(currentXp: number, currentLevel: number): number {
    const nextLevelXp = this.BASE_XP * Math.pow(currentLevel + 1, 2);
    return Math.max(0, nextLevelXp - currentXp);
  }
}
