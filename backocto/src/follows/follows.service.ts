import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService,
  ) {}

  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId)
      throw new BadRequestException("You can't follow yourself");

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!targetUser) throw new NotFoundException('Target user not found');

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      return { status: 'unfollowed', is_following: false };
    } else {
      await this.prisma.userFollow.create({
        data: {
          followerId,
          followingId,
        },
      });

      await this.notifService.create({
        recipientId: followingId,
        actorId: followerId,
        type: 'FOLLOW',
      });

      return { status: 'followed', is_following: true };
    }
  }
}
