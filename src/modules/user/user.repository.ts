import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { id: clerkId },
    });
  }

  async find(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userStats: true,
        avatar: true,
      },
    });
  }

  async update(userId: string, xpGained: number, newLevel: number, xpThreshold: number, xpToNextLevel: number) {
    return this.prisma.userStats.upsert({
      where: { userId },
      update: {
        xp: { increment: xpGained },
        level: newLevel,
        totalXp: { increment: xpGained },
        xpThreshold,
        xpToNextLevel,
      },
      create: {
        userId,
        xp: xpGained,
        level: newLevel,
        totalXp: xpGained,
        xpThreshold,
        xpToNextLevel,
      },
    });
  }

  async findUserWithStats(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { userStats: true },
    });
  }

  async findUserStats(userId: string) {
    return this.prisma.userStats.findUnique({
      where: { userId },
    });
  }
}
