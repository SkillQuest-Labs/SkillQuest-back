import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClerkService {
  constructor(private prisma: PrismaService) {}

  async syncUser(clerkId: string, email: string, username: string, password: string, role: string) {
    return this.prisma.user.upsert({
      where: { clerkId },
      update: {
        email: email || undefined,
        username: username || undefined,
        updatedAt: new Date(),
      },
      create: {
        clerkId,
        email,
        username,
        password,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
