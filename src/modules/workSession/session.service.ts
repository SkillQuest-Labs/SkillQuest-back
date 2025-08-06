import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import SessionRepository from './session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(data: CreateSessionDto) {
    try {
      return await this.sessionRepository.create({
        title: data.title,
        description: data.description,
        color: data.color,
        date: new Date(data.startTime),
        duration: new Date(data.endTime),
        createdAt: new Date(),
        difficultyScore: data.difficultyScore,
        focusLevel: data.focusLevel,
        user: { connect: { id: data.userId } },
        linkedSkill: { connect: { id: data.linkedSkillId } },
        quests: {
          create: {
            quest: { connect: { id: data.questId } },
          },
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

  async getSessionsByUser(userId: string) {
    return this.sessionRepository.findByUserId(userId);
  }

  async getSessionById(id: string) {
    return this.sessionRepository.findById(id);
  }

  async deleteSession(id: string) {
    return this.sessionRepository.delete(id);
  }
}
