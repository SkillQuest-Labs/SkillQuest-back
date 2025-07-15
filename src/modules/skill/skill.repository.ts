import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export default class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SkillCreateInput) {
    return this.prisma.skill.create({ data });
  }

  async findByUserId(userId: string) {
    return this.prisma.skill.findMany({
      where: { userId },
    });
  }

  async findById(id: string) {
    return this.prisma.skill.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.SkillUpdateInput) {
    return this.prisma.skill.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.skill.delete({
      where: { id },
    });
  }
}
