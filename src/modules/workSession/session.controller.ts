import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ListSessionsQueryDto } from './dto/list-sessions-query.dto';
import { ValidateSessionDto } from './dto/validate-session.dto';
import { UserId } from 'src/shared/services/decorators/user-id.decorator';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@Body() sessionData: CreateSessionDto) {
    return this.sessionService.createSession(sessionData);
  }

  @Get('user/:userId')
  async getSessionsByUser(
    @Param('userId') userId: string,
    @Query('getAllSessions') getAllSessions?: string,
  ) {
    const allSessions = getAllSessions ? getAllSessions === 'true' : false;
    return this.sessionService.getSessionsByUser(userId, allSessions);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string) {
    return this.sessionService.deleteSession(id);
  }

  @Get('filter')
  listSessions(@UserId() userId: string, @Query() query: ListSessionsQueryDto) {
    return this.sessionService.listSessions({ ...query, userId });
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    return this.sessionService.getSessionById(id);
  }

  @Put(':id')
  async updateSession(@Param('id') id: string, @Body() data: UpdateSessionDto) {
    return this.sessionService.updateSession(id, data);
  }

  @Post('validate')
  async validateSession(
    @UserId() userId: string,
    @Body() data: ValidateSessionDto,
  ) {
    return this.sessionService.validateSession(data, userId);
  }
}
