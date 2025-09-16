import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async getHudProfile(@Param('userId') userId: string) {
    return this.userService.getUserHudProfile(userId);
  }

  @Post('synch')
  async synchronizeUserData(@Body() userData: UserDto) {
    return this.userService.synchronizeUserData(userData);
  }

  @Get(':userId/stats')
  async getUserStats(@Param('userId') userId: string) {
    return this.userService.getUserStats(userId);
  }
}
