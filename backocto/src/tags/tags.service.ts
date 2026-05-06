import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const tags = await this.prisma.tag.findMany({
      where: search
        ? {
            name: { contains: search, mode: 'insensitive' },
          }
        : {},
      include: {
        _count: {
          select: {
            models: true,
            images: true,
          },
        },
      },
    });

    const res = tags
      .map((tag) => ({
        name: tag.name,
        count: tag._count.models + tag._count.images,
      }))
      .sort((a, b) => b.count - a.count);

    return res;
  }
}
