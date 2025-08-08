import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@Body() sessionData: CreateSessionDto) {
    return this.sessionService.createSession(sessionData);
  }

  @Get('user/:userId')
  async getSessionsByUser(@Param('userId') userId: string) {
    return this.sessionService.getSessionsByUser(userId);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string) {
    return this.sessionService.deleteSession(id);
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    return this.sessionService.getSessionById(id);
  }
}
