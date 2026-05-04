/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getFileHash } from '../common/utils/file-hash.utils';
import fs from 'fs/promises';
import { UpdateModelDto } from './dto/update-model.dto';
import { BaseQueryDto } from '../common/dto/query-params.dto';

@Injectable()
export class ModelsService {
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

  private mapModel(model: any, currentUserId?: number) {
    return {
      ...model,
      file: this.getFileUrl(model.file),
      featuredImage: this.getFileUrl(model.featuredImage?.image),
      model_type: model.modelType,
      is_published: model.isPublished,
      likes_count: model.likesCount ?? model._count?.likes ?? 0,
      is_liked: currentUserId ? model.likes?.length > 0 : false,
      downloads_count: model.downloadsCount,
      created_at: model.createdAt,
      featured_image_url: model.featuredImage
        ? this.getFileUrl(model.featuredImage.image)
        : null,
      author: {
        id: model.authorId,
        username: model.author.username,
        profile: {
          username: model.author.username,
          bio: model.author?.profile.bio ?? '',
          avatar: this.getFileUrl(model.author.profile.avatar),
        },
        followers_count: model.author._count.followers || 0,
        is_following: false,
      },
      tags: model.tags?.map((t: any) => t.name) || [],
    };
  }

  async create(
    userId: number,
    filePath: string,
    dto: any,
    previewPath?: string,
  ) {
    const fileHash = await getFileHash(filePath);
    const dublicate = await this.prisma.aiModel.findFirst({
      where: { fileHash },
    });
    try {
      if (dublicate) {
        await fs.access(filePath);
        await fs.unlink(filePath);
        if (previewPath) {
          await fs.stat(previewPath);
          await fs.unlink(previewPath);
        }
      }
    } catch {
      throw new ConflictException('This model already uploaded');
    }

    const tagsArray = (
      Array.isArray(dto.tags) ? dto.tags : String(dto.tags || '').split(',')
    )
      .map((t) => t.trim())
      .filter(Boolean);

    return this.prisma.aiModel.create({
      data: {
        name: dto.name,
        file: filePath.replace(/\\/g, '/'),
        fileHash: fileHash,
        modelType: dto.model_type,
        description: dto.description || '',
        isPublished: false,
        author: { connect: { id: userId } },

        ...(previewPath && {
          featuredImage: {
            create: {
              image: previewPath.replace(/\\/g, '/'),
              authorId: userId,
              isPublished: false,
              description: `Cover for ${dto.name}`,
            },
          },
        }),

        tags: {
          connectOrCreate: tagsArray.map((tag: any) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { tags: true, author: true, featuredImage: true },
    });
  }

  async findAll(query: BaseQueryDto, currentUserId?: number) {
    const { ordering, author, tag, created_after, feed, model_type } = query;

    const where: any = {};

    if (currentUserId) {
      where.OR = [{ isPublished: true }, { authorId: currentUserId }];
    } else {
      where.isPublished = true;
    }

    if (author) {
      where.authorId = Number(author);
    }

    if (tag) {
      where.tags = { some: { name: tag } };
    }

    if (created_after) {
      where.createdAt = { gte: new Date(created_after) };
    }

    if (feed === 'following' && currentUserId) {
      where.author = {
        followers: { some: { followerId: currentUserId } },
      };
    }

    if (model_type) where.modelType = query.model_type;

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

      const prismaField = fieldMap[field];
      orderBy = { [prismaField]: isDesc ? 'desc' : 'asc' };
    }

    const [items, count] = await Promise.all([
      this.prisma.aiModel.findMany({
        where,
        orderBy,
        include: {
          featuredImage: true,
          author: {
            select: {
              id: true,
              username: true,
              followers: true,
              profile: { select: { avatar: true } },
              _count: { select: { followers: true } },
            },
          },
          likes: currentUserId ? { where: { userId: currentUserId } } : false,
          tags: true,
          _count: {
            select: { comments: true, likes: true },
          },
        },
      }),
      this.prisma.aiModel.count({ where }),
    ]);

    return {
      count,
      results: items.map((model) => this.mapModel(model, currentUserId)),
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const model = await this.prisma.aiModel.findUnique({
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
        tags: true,
        featuredImage: true,
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
            }
          : false,
        _count: { select: { likes: true } },
      },
    });
    if (!model) throw new NotFoundException('Model not found');

    return this.mapModel(model, currentUserId);
  }

  async update(id: number, userId: number, dto: UpdateModelDto) {
    const existing = await this.prisma.aiModel.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException();
    if (existing.authorId !== userId)
      throw new ForbiddenException('User have no access to this object');

    const updated = await this.prisma.aiModel.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isPublished: dto.is_published,
        modelType: dto.model_type,
        tags: dto.tags
          ? {
              set: [],
              connectOrCreate: dto.tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            followers: true,
            profile: { select: { avatar: true } },
            _count: { select: { followers: true } },
          },
        },
        tags: true,
      },
    });
    return this.mapModel(updated);
  }

  async remove(id: number, userId) {
    const model = await this.findOne(id);
    if (model.authorId !== userId)
      throw new ForbiddenException('User have no access to this object');

    try {
      await fs.access(model.file);
      await fs.unlink(model.file);
    } catch (e) {
      console.warn(`File not found or cannot be deleted: ${model.file}`, e);
    }

    return this.prisma.aiModel.delete({ where: { id } });
  }

  async incrementDownload(id: number) {
    const model = await this.prisma.aiModel.update({
      where: { id },
      data: {
        downloadsCount: { increment: 1 },
      },
    });
    return { url: this.getFileUrl(model.file), id: model.id };
  }
}
