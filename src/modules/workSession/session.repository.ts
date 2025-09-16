import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export default class SessionRepository {
  private readonly DEFAULT_SESSION_LIMIT = 10;

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
      where: { 
        userId,
        isValidated: false
      },
      include: {
        quests: {
          include: { quest: true },
        },
        linkedSkill: {
          select: {
            title: true,
          },
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

  async findByFilters(filters: {
    userId: string;
    skill?: string;
    quest?: string;
    date?: string;
    limit?: number;
    page?: number;
  }) {
    const { userId, skill, quest, date, limit, page = 1 } = filters;

    const where: Prisma.WorkSessionWhereInput = { 
      userId,
      isValidated: false
    };

    const skillTerm = skill?.trim();
    if (skillTerm) {
      where.linkedSkill = {
        is: { title: { contains: skillTerm, mode: 'insensitive' } },
      };
    }

    const questTerm = quest?.trim();
    if (questTerm) {
      where.quests = {
        some: {
          quest: {
            is: {
              title: { contains: questTerm, mode: 'insensitive' },
            },
          },
        },
      };
    }

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.date = { gte: start, lte: end };
    }

    const pageSize = Math.min(Math.max(Number(limit) || this.DEFAULT_SESSION_LIMIT, 1), 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const offset = (currentPage - 1) * pageSize;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.workSession.count({ where }),
      this.prisma.workSession.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        include: {
          quests: { include: { quest: true } },
          linkedSkill: { select: { title: true } },
        },
      }),
    ]);

    return {
      items,
      total,
      page: currentPage,
      limit: pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async validateSession(sessionId: string) {
    return this.prisma.workSession.update({
      where: { id: sessionId },
      data: { isValidated: true },
    });
  }

}
