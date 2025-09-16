import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import SkillRepository from './skill.repository';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async createSkill(skillData: CreateSkillDto) {
    try {
      const { userId, ...rest } = skillData;

      return await this.skillRepository.create({
        ...rest,
        user: { connect: { id: userId } },
      });
    } catch (error) {
      throw new BadRequestException(
        `Invalid skill creation payload, erreur: ${error}`,
      );
    }
  }

  async getSkillsByUserId(userId: string) {
    return this.skillRepository.findByUserId(userId);
  }

  async getSkillById(id: string) {
    return this.skillRepository.findById(id);
  }

  async updateSkill(id: string, data: UpdateSkillDto) {
    return this.skillRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  async deleteSkill(id: string) {
    return this.skillRepository.delete(id);
  }
}
