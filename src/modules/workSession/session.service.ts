import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import SessionRepository from './session.repository';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ListSessionsQueryDto } from './dto/list-sessions-query.dto';
import { ValidateSessionDto } from './dto/validate-session.dto';
import { XpCalculationService } from '../../shared/services/xp-calculation.service';
import { SessionValidationData, QuestXpData } from '../../shared/interfaces/xp-calculation.interface';
import { QuestRepository } from '../quest/quest.repository';
import { UserRepository } from '../user/user.repository';
import SkillRepository from '../skill/skill.repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly xpCalculationService: XpCalculationService,
    private readonly questRepository: QuestRepository,
    private readonly userRepository: UserRepository,
    private readonly skillRepository: SkillRepository,
  ) {}

  async createSession(data: CreateSessionDto) {
    try {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const sessionDuration = this.getSessionDuration({ startTime, endTime });
      return await this.sessionRepository.create({
        title: data.title,
        description: data.description,
        color: data.color,
        date: new Date(data.startDate),
        startTime: startTime,
        endTime: endTime,
        duration: sessionDuration,
        createdAt: new Date(),
        user: { connect: { id: data.userId } },
        linkedSkill: { connect: { id: data.linkedSkillId } },
        quests: {
          createMany: { data: data.questIds.map((questId) => ({ questId })) },
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Invalid session creation payload: ${error.message}`,
        );
      }
      throw new BadRequestException('Invalid session creation payload');
    }
  }

  async updateSession(id: string, data: UpdateSessionDto) {
    const session = await this.sessionRepository.findById(id);
    if (!session) throw new NotFoundException('Session not found');

    try {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const sessionDuration = this.getSessionDuration({ startTime, endTime });

      return await this.sessionRepository.update(id, {
        title: data.title,
        description: data.description,
        color: data.color,
        date: new Date(data.startDate),
        startTime: startTime,
        endTime: endTime,
        duration: sessionDuration,
        user: { connect: { id: data.userId } },
        linkedSkill: { connect: { id: data.linkedSkillId } },
        quests: {
          deleteMany: {},
          createMany: { data: data.questIds.map((questId) => ({ questId })) },
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Invalid session update payload: ${error.message}`,
        );
      }
      throw new BadRequestException('Invalid session update payload');
    }
  }

  async listSessions(query: ListSessionsQueryDto & { userId: string }) {
    try {
      const { userId, ...filters } = query;
      return await this.sessionRepository.findByFilters({ ...filters, userId });
    } catch {
      throw new BadRequestException('Impossible de lister les sessions');
    }
  }

  async getSessionsByUser(userId: string) {
    return this.sessionRepository.findByUserId(userId);
  }

  async getSessionById(id: string) {
    return this.sessionRepository.findById(id);
  }

  async deleteSession(id: string) {
    return this.sessionRepository.delete(id);
  }

  private getSessionDuration(data: { startTime: Date; endTime: Date }) {
    const durationMs = data.endTime.getTime() - data.startTime.getTime();

    return Math.floor(durationMs / 60000);
  }

  private async updateQuestsFromCalculation(questXpData: QuestXpData[]) {
    const questXpUpdates = questXpData.map(quest => ({
      questId: quest.questId,
      xpGained: quest.xpGained,
    }));
    await this.questRepository.incrementQuestXp(questXpUpdates);

    for (const quest of questXpData) {
      await this.questRepository.updateQuestStatusById(quest.questId, quest.status);
    }
  }

  async validateSession(data: ValidateSessionDto, userId: string) {
    try {
      const session = await this.sessionRepository.findById(data.sessionId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (session.userId !== userId) {
        throw new BadRequestException(
          'You can only validate your own sessions',
        );
      }

      const user = await this.userRepository.findUserWithStats(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userLevel = user.userStats?.level || 1;
      const currentXp = user.userStats?.xp || 0;

      const allQuestIds = session.quests.map(quest => quest.questId);
      const allQuests = await this.questRepository.findByIds(allQuestIds);
      const completedQuestIds = data.completedQuests.map(quest => quest.id);

      const sessionData: SessionValidationData = {
        duration: session.duration,
        questsCompleted: data.completedQuests.length,
        userLevel,
        currentXp,
        quests: allQuests.map(quest => ({
          id: quest.id,
          baseXp: quest.xp || 10,
          isCompleted: completedQuestIds.includes(quest.id),
        })),
      };

      const xpResult =
        this.xpCalculationService.calculateSessionXp(sessionData);

      await this.userRepository.update(
        userId,
        xpResult.xpGained,
        xpResult.newLevel,
      );

      await this.updateQuestsFromCalculation(xpResult.questXpData);

      await this.sessionRepository.validateSession(data.sessionId);

      await this.skillRepository.updateSkillStats(session.linkedSkillId);

      return {
        sessionId: data.sessionId,
        xpGained: xpResult.xpGained,
        newLevel: xpResult.newLevel,
        levelUp: xpResult.levelUp,
        xpToNextLevel: xpResult.xpToNextLevel,
        completedQuests: data.completedQuests,
        message: xpResult.levelUp
          ? `Félicitations ! Vous avez gagné ${xpResult.xpGained} XP et atteint le niveau ${xpResult.newLevel} !`
          : `Session validée ! Vous avez gagné ${xpResult.xpGained} XP.`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error validating session: ${error.message}`,
      );
    }
  }
}
