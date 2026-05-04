/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LikesDto } from './dto/likes.dto';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: number, dto: LikesDto) {
    const { image, aimodel } = dto;

    if (!image && !aimodel) {
      throw new BadRequestException(`You must provide 'image' or 'aimodel' ID`);
    }

    const targetField = image ? 'imageId' : 'modelId';
    const targetId = image || aimodel;
    const targetTable = image ? 'generatedImage' : 'aiModel';

    const existingLike = await this.prisma.like.findFirst({
      where: { userId, [targetField]: targetId },
    });

    if (existingLike) {
      return this.prisma.$transaction(async (tx) => {
        await tx.like.delete({ where: { id: existingLike.id } });
        const updated = await (tx[targetTable] as any).update({
          where: { id: targetId },
          data: { likesCount: { decrement: 1 } },
        });

        return { status: 'unliked', likes_count: updated.likesCount };
      });
    } else {
      return this.prisma.$transaction(async (tx) => {
        await tx.like.create({ data: { userId, [targetField]: targetId } });

        const updated = await (tx[targetTable] as any).update({
          where: { id: targetId },
          data: { likesCount: { increment: 1 } },
        });

        return { status: 'liked', likes_count: updated.likesCount };
      });
    }
  }
}
