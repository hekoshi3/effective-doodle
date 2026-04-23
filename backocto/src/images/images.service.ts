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
import * as fs from 'fs';

@Injectable()
export class ImagesService {
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

  private mapImage(img: any) {
    return {
      ...img,
      image: this.getFileUrl(img.image),
      is_published: img.isPublished,
      likes_count: img.likes_count ?? img._count?.likes ?? 0,
      author: img.author
        ? {
            ...img.author,
            profile: img.author.profile
              ? {
                  ...img.author.profile,
                  avatar: this.getFileUrl(img.author.profile.avatar),
                  bio: img.author.bio,
                }
              : null,
          }
        : null,
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
      return this.mapImage(result);
    } catch (e) {
      console.error('[Error] Prisma Create failed:', e);
      throw e;
    }
  }

  async findAll() {
    const images = await this.prisma.generatedImage.findMany({
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

    const results = images.map((img) => this.mapImage(img));

    return { count: results.length, results };
  }

  async findOne(id: number) {
    const img = await this.prisma.generatedImage.findUnique({
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
        linkedModel: true,
      },
    });
    if (!img) throw new NotFoundException('Image not found');
    return this.mapImage(img);
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
      include: { tags: true },
    });
    return this.mapImage(updated);
  }

  async remove(id: number, userId) {
    const img = await this.findOne(id);
    if (img.authorId !== userId)
      throw new ForbiddenException('User have no access to this object');

    if (fs.existsSync(img.image)) fs.unlinkSync(img.image);

    return this.prisma.generatedImage.delete({ where: { id } });
  }
}
