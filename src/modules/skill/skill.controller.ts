import { Controller, Post, Body } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  async createSkill(@Body() skillData: CreateSkillDto) {
    const createdSkill = await this.skillService.createSkill(skillData);
    return createdSkill;
  }
}
