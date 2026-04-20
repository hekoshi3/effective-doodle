/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extractAIMetadata } from '../common/utils/ai-metadata.parser';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

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
          generationParams: {
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
        select: {
          id: true,
          image: true,
          description: true,
          isPublished: true,
          likesCount: true,
          createdAt: true,
          generationParams: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
          tags: true,
        },
      });
      return result;
    } catch (e) {
      console.error('[Error] Prisma Create failed:', e);
      throw e;
    }
  }

  async findAll(currentUserId?: number) {
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

    const results = images.map((img) => {
      const rating = img._count.likes * 1 + img._count.comments * 3;
      return {
        ...img,
        rating,
        is_published: img.isPublished,
        likes_count: img._count.likes,
        comments_count: img._count.comments,
        is_liked: currentUserId ? false : false,
        tags: img.tags.map((t) => t.name),
      };
    });

    return { count: results.length, results };
  }

  async findOne(id: number) {
    const img = await this.prisma.generatedImage.findUnique({
      where: { id },
      include: {
        author: { include: { profile: true } },
        tags: true,
        linkedModel: true,
      },
    });
    if (!img) throw new NotFoundException('Image not found');
    return img;
  }
}
