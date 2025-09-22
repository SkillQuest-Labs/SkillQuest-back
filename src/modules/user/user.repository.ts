import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: {
        ...userData,
        userStats: {
          create: {
            xp: 0,
            rp: 0,
            level: 1,
            totalXp: 0,
            xpThreshold: 100,
            xpToNextLevel: 100,
            loginStreak: 0,
            maxSessionStreak: 0,
          },
        },
      },
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

  async createDefaultUserStats(userId: string) {
    return this.prisma.userStats.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        xp: 0,
        rp: 0,
        level: 1,
        totalXp: 0,
        xpThreshold: 100,
        xpToNextLevel: 100,
        loginStreak: 0,
        maxSessionStreak: 0,
      },
    });
  }
}
