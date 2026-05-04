/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommentDto } from './dto/comments.dto';

@Injectable()
export class CommentsService {
  private readonly backendUrl =
    process.env.BACKEND_URL! + ':' + process.env.BACKEND_PORT! ||
    'http://127.0.0.1:5001';
  constructor(private prisma: PrismaService) {}

  getFileUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const cleanPath = path.replace(/\\/g, '/');
    return `${this.backendUrl}/${cleanPath}`;
  }

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
          avatar: this.getFileUrl(comm.user.profile.avatar),
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
      },
    });

    const mentionedUsers = text.match(/@(\w+)/g);
    if (mentionedUsers) {
      console.log(`Found user mentions: ${mentionedUsers.join(', ')}`);
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
