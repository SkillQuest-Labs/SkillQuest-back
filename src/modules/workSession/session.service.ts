import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import SessionRepository from './session.repository';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(data: CreateSessionDto) {
    try {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const durationSession = this.getDurationSession({ startTime, endTime });
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
      const durationSession = this.getDurationSession({ startTime, endTime });

      return await this.sessionRepository.update(id, {
        title: data.title,
        description: data.description,
        color: data.color,
        date: new Date(data.startDate),
        startTime: startTime,
        endTime: endTime,
        duration: durationSession,
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

  async getSessionsByUser(userId: string) {
    return this.sessionRepository.findByUserId(userId);
  }

  async getSessionById(id: string) {
    return this.sessionRepository.findById(id);
  }

  async deleteSession(id: string) {
    return this.sessionRepository.delete(id);
  }

  private getDurationSession(data: { startTime: Date; endTime: Date }) {
    const durationMs = data.endTime.getTime() - data.startTime.getTime();

    return Math.floor(durationMs / 60000);
  }
}
