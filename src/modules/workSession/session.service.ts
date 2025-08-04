import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import SessionRepository from './session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(data: CreateSessionDto) {
    try {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      if (end <= start) {
        throw new BadRequestException('endTime must be after startTime');
      }

      return await this.sessionRepository.create({
        date: start,
        duration: end,
        createdAt: new Date(),
        difficultyScore: data.difficultyScore,
        focusLevel: data.focusLevel,
        user: { connect: { id: data.userId } },
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
