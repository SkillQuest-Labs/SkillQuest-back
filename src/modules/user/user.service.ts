import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserHudProfile(userId: string) {
    const user = await this.userRepository.find(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.userStats?.xp,
      role: user.role,
      level: user.userStats?.level,
      urlAvatar: user.avatar?.urlImage ?? null,
    };
  }
}
