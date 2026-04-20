/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, filePath: string, body: any) {
    const tagsArray = Array.isArray(body.tags) ? body.tags : [];

    return this.prisma.generatedImage.create({
      data: {
        image: filePath,
        description: body.description,
        generationParams: body.generationParams
          ? JSON.parse(body.generationParams)
          : {},
        isPublished: body.is_published === 'true',
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
    const [items, count] = await Promise.all([
      this.prisma.generatedImage.findMany({
        where: { isPublished: true },
        include: {
          author: { include: { profile: true } },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.generatedImage.count({ where: { isPublished: true } }),
    ]);

    return {
      count,
      next: null,
      previous: null,
      results: items,
    };
  }
}
