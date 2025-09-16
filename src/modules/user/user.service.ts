import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user.dto';
import { UserStatsDto } from './dto/user-stats.dto';

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

  async synchronizeUserData(userData: UserDto) {
    const existingUser = await this.userRepository.findByClerkId(userData.id);

    if (existingUser) {
      return existingUser;
    }

    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.userRepository.create(newUser);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const userStats = await this.userRepository.findUserStats(userId);

    if (!userStats) {
      throw new Error('User stats not found');
    }

    return {
      level: userStats.level,
      totalXP: userStats.xp ?? 0,
      xpTheshold: userStats.xpThreshold,
      xpToNextLevel: userStats.xpToNextLevel,
    };
  }
}
