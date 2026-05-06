/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extractAIMetadata } from '../common/utils/ai-metadata.parser';
import { UpdateImageDto } from './dto/update-image.dto';
import fs from 'fs/promises';
import { BaseQueryDto } from '../common/dto/query-params.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ImagesService {
  private readonly backendUrl = process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}:${process.env.BACKEND_PORT}`
    : 'http://127.0.0.1:5001';
  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService,
  ) {}

  getFileUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const cleanPath = path.replace(/\\/g, '/');
    return `${this.backendUrl}/${cleanPath}`;
  }

  private mapImage(img: any, currentUserId?: number) {
    return {
      ...img,
      image: this.getFileUrl(img.image),
      is_published: img.isPublished,
      likes_count: img.likes_count ?? img._count?.likes ?? 0,
      is_liked: currentUserId ? img.likes?.length > 0 : false,
      created_at: img.createdAt,
      author: {
        id: img.authorId,
        username: img.author.username,
        profile: {
          username: img.author.username,
          bio: img.author?.profile.bio ?? '',
          avatar: this.getFileUrl(img.author.profile.avatar),
        },
        followers_count: img.author._count?.followers || 0,
        is_following: false,
      },
      tags: img.tags?.map((t: any) => t.name) || [],
    };
  }

  async create(userId: number, filePath: string, body: any) {
    const aiData = await extractAIMetadata(filePath);

    const tagsArray = (
      Array.isArray(body.tags) ? body.tags : String(body.tags || '').split(',')
    )
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const result = await this.prisma.generatedImage.create({
        data: {
          image: filePath.replace(/\\/g, '/'),
          description: body.description || '',
          generation_params: {
            ...aiData,
          },
          isPublished:
            body.is_published === 'true' || body.is_published === true,
          author: { connect: { id: userId } },
          tags: {
            connectOrCreate: tagsArray.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile: { select: { avatar: true } },
            },
          },
          tags: true,
        },
      });

      if (result.isPublished) {
        this.notifService
          .notifyFollowers(userId, 'NEW_POST', { imageId: result.id })
          .catch((e) => console.error('Notification background error:', e)); // Безопасный перехват
      }

      return this.mapImage(result);
    } catch (e) {
      console.error('[Error] Prisma Create failed:', e);
      throw e;
    }
  }

  async findAll(query: BaseQueryDto, currentUserId?: number) {
    const { ordering, author, tag, created_after, feed, search } = query;

    const where: any = {
      AND: [
        currentUserId
          ? { OR: [{ isPublished: true }, { authorId: currentUserId }] }
          : { isPublished: true },
      ],
    };

    if (search) {
      where.AND.push({
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { author: { username: { contains: search, mode: 'insensitive' } } },
          {
            tags: { some: { name: { contains: search, mode: 'insensitive' } } },
          },
        ],
      });
    }

    if (author) {
      where.AND.push({ authorId: Number(author) });
    }

    if (tag) {
      where.AND.push({ tags: { some: { name: tag } } });
    }

    if (created_after) {
      where.AND.push({ createdAt: { gte: new Date(created_after) } });
    }

    if (feed === 'following' && currentUserId) {
      where.author = {
        followers: { some: { followerId: currentUserId } },
      };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (ordering) {
      const isDesc = ordering.startsWith('-');
      const field = isDesc ? ordering.substring(1) : ordering;

      const fieldMap: Record<string, string> = {
        created_at: 'createdAt',
        likes_count: 'likesCount',
        downloads_count: 'downloadsCount',
        rating: 'likesCount',
      };

      const prismaField = fieldMap[field] || field;
      orderBy = { [prismaField]: isDesc ? 'desc' : 'asc' };
    }

    const [items, count] = await Promise.all([
      this.prisma.generatedImage.findMany({
        where,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile: { select: { avatar: true } },
              _count: { select: { followers: true } },
            },
          },
          likes: currentUserId ? { where: { userId: currentUserId } } : false,
          tags: true,
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.generatedImage.count({ where }),
    ]);

    return {
      count,
      results: items.map((img) => this.mapImage(img, currentUserId)),
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const img = await this.prisma.generatedImage.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
            _count: { select: { followers: true } },
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
            }
          : false,
        _count: { select: { likes: true } },
        tags: true,
        linkedModel: true,
      },
    });
    if (!img) throw new NotFoundException('Image not found');
    return this.mapImage(img, currentUserId);
  }

  async update(id: number, userId: number, dto: UpdateImageDto) {
    const existing = await this.prisma.generatedImage.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException();
    if (existing.authorId !== userId)
      throw new ForbiddenException('User have no access to this object');

    const { tags, is_published, linked_model, ...data } = dto;

    const updated = await this.prisma.generatedImage.update({
      where: { id },
      data: {
        ...data,
        isPublished: is_published,
        ...(linked_model && { linkedModel: { connect: { id: linked_model } } }),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
            _count: { select: { followers: true } },
          },
        },
        tags: true,
      },
    });

    if (updated.isPublished) {
      this.notifService
        .notifyFollowers(userId, 'NEW_POST', { imageId: updated.id })
        .catch((e) => console.error('Notification background error:', e)); // Безопасный перехват
    }

    return this.mapImage(updated);
  }

  async remove(id: number, userId) {
    const img = await this.findOne(id);
    if (img.authorId !== userId)
      throw new ForbiddenException('User has no access to this object');
    try {
      await fs.access(img.file);
      await fs.unlink(img.file);
    } catch (e) {
      console.warn(`File not found or cannot be deleted: ${img.file}`, e);
    }

    return this.prisma.generatedImage.delete({ where: { id } });
  }
}
