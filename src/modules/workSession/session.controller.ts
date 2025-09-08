import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ListSessionsQueryDto } from './dto/list-sessions-query.dto';
import { getAuth } from '@clerk/express';
import type { Request as ExpressRequest } from 'express';

function hasUserId(auth: unknown): auth is { userId: string } {
  return typeof (auth as { userId?: unknown })?.userId === 'string';
}

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

  @Get('filter')
  listSessions(
    @Req() req: ExpressRequest,
    @Query() query: ListSessionsQueryDto,
  ) {
    const auth = getAuth(req);
    if (!hasUserId(auth)) throw new UnauthorizedException();
    return this.sessionService.listSessions({ ...query, userId: auth.userId });
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    return this.sessionService.getSessionById(id);
  }

  @Put(':id')
  async updateSession(@Param('id') id: string, @Body() data: UpdateSessionDto) {
    return this.sessionService.updateSession(id, data);
  }
}
