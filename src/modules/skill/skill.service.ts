import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import SkillRepository from './skill.repository';

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
}
