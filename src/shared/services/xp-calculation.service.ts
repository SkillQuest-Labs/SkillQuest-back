import { Injectable } from '@nestjs/common';
import { XpCalculationResult, SessionValidationData } from '../interfaces/xp-calculation.interface';

@Injectable()
export class XpCalculationService {
  private readonly BASE_XP = 100;
  private readonly QUEST_BONUS_MULTIPLIER = 1.1;
  private readonly MIN_SESSION_DURATION = 15;

  calculateSessionXp(data: SessionValidationData): XpCalculationResult {
    const { duration, questsCompleted, userLevel, currentXp, questXpValues } = data;

    if (duration < this.MIN_SESSION_DURATION) {
      return {
        xpGained: 0,
        newLevel: userLevel,
        levelUp: false,
        xpToNextLevel: this.calculateXpToNextLevel(currentXp, userLevel),
      };
    }

    const durationXp = (duration / 60) * 10;
    
    const questXp = questXpValues.reduce((sum, xp) => sum + xp, 0);
    
    const questBonus = 1 + (questsCompleted * this.QUEST_BONUS_MULTIPLIER);
    
    const xpGained = Math.floor(
      (durationXp + questXp) * questBonus
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
