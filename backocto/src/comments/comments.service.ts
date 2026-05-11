/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommentDto } from './dto/comments.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MediaService } from '../common/media/media.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService,
    private mediaService: MediaService,
  ) {}

  private mapComment(comm: any) {
    // !!! add delete or editing, ', currentUserId?: number'
    return {
      id: comm.id,
      text: comm.text,
      created_at: comm.createdAt,
      image: comm.imageId,
      aimodel: comm.modelId,
      author: {
        id: comm.userId,
        username: comm.user.username,
        profile: {
          username: comm.user.username,
          bio: comm.user?.bio ?? '',
          avatar: this.mediaService.getAbsoluteUrl(comm.user.profile.avatar),
        },
      },
    };
  }

  async create(userId: number, dto: CommentDto) {
    const { text, image, aimodel } = dto;

    if (!image && !aimodel) {
      throw new BadRequestException(
        `Comment must be linked to 'image' or 'aimodel'`,
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        text,
        user: { connect: { id: userId } },
        ...(image && { image: { connect: { id: image } } }),
        ...(aimodel && { model: { connect: { id: aimodel } } }),
      },
      include: {
        user: { include: { profile: true } },
        image: { select: { authorId: true } },
        model: { select: { authorId: true } },
      },
    });

    const regex = /@(\w+)/g;
    const matches = [...text.matchAll(regex)];
    const usernames = matches.map((match) => match[1]);
    const postAuthorId = comment.image?.authorId || comment.model?.authorId;
    if (usernames.length > 0) {
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          username: { in: usernames, mode: 'insensitive' },
        },
        select: { id: true },
      });

      const recipientIds = mentionedUsers
        .map((u) => u.id)
        .filter((id) => id !== userId && id !== postAuthorId);

      if (recipientIds.length > 0) {
        this.notifService
          .createManyMentions({
            recipientIds,
            actorId: userId,
            commentId: comment.id,
            imageId: image,
            modelId: aimodel,
          })
          .catch((e) => console.error('Mention notification error:', e));
      }
    }

    if (postAuthorId && postAuthorId !== userId) {
      this.notifService
        .create({
          recipientId: postAuthorId,
          actorId: userId,
          type: 'COMMENT',
          commentId: comment.id,
          imageId: image,
          modelId: aimodel,
        })
        .catch((e) => console.error('Author notification error:', e));
    }

    return this.mapComment(comment);
  }

  async findAll(query: { image?: number; aimodel?: number }) {
    const where: any = {};
    if (query.image) where.imageId = Number(query.image);
    if (query.aimodel) where.modelId = Number(query.aimodel);

    const comments = await this.prisma.comment.findMany({
      where,
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: comments.length,
      results: comments.map((c) => this.mapComment(c)),
    };
  }
}
