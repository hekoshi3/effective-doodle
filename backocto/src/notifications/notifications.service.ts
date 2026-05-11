import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '../generated/prisma/enums';
import { MediaService } from '../common/media/media.service';

type NotificationWithActor = Prisma.NotificationGetPayload<{
  include: {
    actor: {
      select: {
        id: true;
        username: true;
        profile: { select: { avatar: true } };
      };
    };
  };
}>;

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}
  private mapNotifications(n: NotificationWithActor) {
    return {
      id: n.id,
      type: n.type,
      is_read: n.isRead,
      created_at: n.createdAt,
      image: n.imageId,
      aimodel: n.modelId,
      comment: n.commentId,
      actor: {
        id: n.actor.id,
        username: n.actor.username,
        profile: {
          username: n.actor.username,
          avatar: this.mediaService.getAbsoluteUrl(
            n.actor.profile?.avatar ?? '',
          ),
        },
      },
    };
  }

  async create(data: {
    recipientId: number;
    actorId: number;
    imageId?: number;
    modelId?: number;
    commentId?: number;
    type: NotificationType;
  }) {
    if (data.recipientId === data.actorId) return;

    return this.prisma.notification.create({
      data: {
        type: data.type,
        recipientId: data.recipientId,
        actorId: data.actorId,
        imageId: data.imageId,
        modelId: data.modelId,
        commentId: data.commentId,
      },
    });
  }

  async notifyFollowers(
    authorId: number,
    type: NotificationType,
    content: { imageId?: number; modelId?: number },
  ) {
    const followers = await this.prisma.userFollow.findMany({
      where: { followingId: authorId },
      select: { followerId: true },
    });

    if (followers.length === 0) return;

    const data = followers.map((f) => ({
      type: type,
      recipientId: f.followerId,
      actorId: authorId,
      imageId: content.imageId || null,
      modelId: content.modelId || null,
      createdAt: new Date(),
    }));

    return this.prisma.notification.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async createManyMentions(data: {
    recipientIds: number[];
    actorId: number;
    commentId: number;
    imageId?: number;
    modelId?: number;
  }) {
    const notifications = data.recipientIds.map((id) => ({
      recipientId: id,
      actorId: data.actorId,
      type: 'MENTION' as const,
      commentId: data.commentId,
      imageId: data.imageId || null,
      modelId: data.modelId || null,
      createdAt: new Date(),
    }));

    return this.prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
  }

  async findAll(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return {
      results: notifications.map((n) => this.mapNotifications(n)),
    };
  }

  async update(id: number, userId: number, data: { isRead?: boolean }) {
    const notif = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notif || notif.recipientId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: data.isRead },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
          },
        },
      },
    });
    return this.mapNotifications(updated);
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { status: 'All marked read' };
  }
}
