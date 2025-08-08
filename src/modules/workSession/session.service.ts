import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import SessionRepository from './session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(data: CreateSessionDto) {
    try {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationSession = Math.floor(durationMs / 60000);

      return await this.sessionRepository.create({
        title: data.title,
        description: data.description,
        color: data.color,
        date: new Date(data.startDate),
        startTime: startTime,
        endTime: endTime,
        duration: durationSession,
        createdAt: new Date(),
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
