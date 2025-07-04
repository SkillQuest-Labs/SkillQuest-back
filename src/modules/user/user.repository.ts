import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserProfileById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userStats: true,
        avatar: true,
      },
    });
  }
}
