import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getHUDProfile(@Query('userId') userId: string) {
    return this.userService.getUserHUDProfile(userId);
  }
}
