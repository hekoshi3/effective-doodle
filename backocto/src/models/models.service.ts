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
import * as fs from 'fs';
import { UpdateModelDto } from './dto/update-model.dto';

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

  private mapModel(model: any) {
    return {
      ...model,
      file: this.getFileUrl(model.file),
      featuredImage: this.getFileUrl(model.featuredImage?.image),
      model_type: model.modelType,
      is_published: model.isPublished,
      likes_count: model.likesCount ?? model._count?.likes ?? 0,
      downloads_count: model.downloadsCount,
      created_at: model.createdAt,
      author: {
        id: model.authorId,
        username: model.author.username,
        profile: {
          username: model.author.username,
          bio: model.author?.bio ?? '',
          avatar: this.getFileUrl(model.author.avatar),
        },
        followers_count: model.author._count?.followers || 0,
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
    if (dublicate) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (previewPath && fs.existsSync(previewPath)) fs.unlinkSync(previewPath);
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
        tags: {
          connectOrCreate: tagsArray.map((tag: any) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { tags: true, author: true },
    });
  }

  async findAll() {
    const models = await this.prisma.aiModel.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
          },
        },
        tags: true,
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const results = models.map((img) => this.mapModel(img));

    return { count: results.length, results };
  }

  async findOne(id: number) {
    const model = await this.prisma.aiModel.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
          },
        },
        tags: true,
        featuredImage: true,
      },
    });
    if (!model) throw new NotFoundException('Model not found');
    return this.mapModel(model);
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
      include: { author: { include: { profile: true } }, tags: true },
    });
    return this.mapModel(updated);
  }

  async remove(id: number, userId) {
    const model = await this.findOne(id);
    if (model.authorId !== userId)
      throw new ForbiddenException('User have no access to this object');

    if (fs.existsSync(model.file)) fs.unlinkSync(model.file);

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
