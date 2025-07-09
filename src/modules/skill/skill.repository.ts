import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export default class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SkillCreateInput) {
    return this.prisma.skill.create({ data });
  }
}
