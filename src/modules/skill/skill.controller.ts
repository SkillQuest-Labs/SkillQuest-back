import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  async createSkill(@Body() skillData: CreateSkillDto) {
    const createdSkill = await this.skillService.createSkill(skillData);
    return createdSkill;
  }

  @Get('user/:userId')
  async getUserSkills(@Param('userId') userId: string) {
    return this.skillService.getSkillsByUserId(userId);
  }

  @Get(':id')
  async getSkillById(@Param('id') id: string) {
    return this.skillService.getSkillById(id);
  }

  @Put(':id')
  async updateSkill(@Param('id') id: string, @Body() data: UpdateSkillDto) {
    return this.skillService.updateSkill(id, data);
  }

  @Delete(':id')
  async deleteSkill(@Param('id') id: string) {
    return this.skillService.deleteSkill(id);
  }
}
