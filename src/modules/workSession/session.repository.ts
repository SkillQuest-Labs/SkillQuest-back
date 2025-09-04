import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export default class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkSessionCreateInput) {
    return this.prisma.workSession.create({
      data,
      include: {
        quests: true,
      },
    });
  }

  async update(sessionId: string, session: Prisma.WorkSessionUpdateInput) {
    return this.prisma.workSession.update({
      where: { id: sessionId },
      data: session,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.workSession.findMany({
      where: { userId },
      include: {
        quests: {
          include: { quest: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.workSession.findUnique({
      where: { id },
      include: {
        quests: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.workSession.delete({
      where: { id },
    });
  }
}
