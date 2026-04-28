import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
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

  async findAll(currentUserId?: number) {
    const users = await this.prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: { followers: true },
        },
        followers: currentUserId
          ? { where: { followerId: currentUserId } }
          : undefined,
      },
    });

    const results = users.map((u) => ({
      id: u.id,
      username: u.username,
      profile: {
        username: u.username,
        bio: u.profile?.bio || '',
        avatar: this.getFileUrl(u.profile!.avatar),
        banner: this.getFileUrl(u.profile!.banner),
      },
      followers_count: u._count.followers,
      is_following: currentUserId ? u.followers.length > 0 : false,
    }));

    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const [
      downloadsAgg,
      modelLikesAgg,
      imageLikesAgg,
      followersCount,
      modelsCount,
      imagesCount,
    ] = await Promise.all([
      this.prisma.aiModel.aggregate({
        _sum: { downloadsCount: true },
        where: { authorId: userId },
      }),
      this.prisma.aiModel.aggregate({
        _sum: { likesCount: true },
        where: { authorId: userId },
      }),

      this.prisma.generatedImage.aggregate({
        _sum: { likesCount: true },
        where: { authorId: userId },
      }),

      this.prisma.userFollow.count({ where: { followingId: userId } }),
      this.prisma.aiModel.count({ where: { authorId: userId } }),
      this.prisma.generatedImage.count({ where: { authorId: userId } }),
    ]);

    const totalLikes =
      (modelLikesAgg._sum.likesCount || 0) +
      (imageLikesAgg._sum.likesCount || 0);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: '',
      last_name: '',
      bio: user.profile?.bio || '',
      avatar: this.getFileUrl(user.profile!.avatar),
      banner: this.getFileUrl(user.profile!.banner),
      stats: {
        total_downloads: downloadsAgg._sum.downloadsCount || 0,
        total_likes: totalLikes,
        followers: followersCount,
        models_count: modelsCount,
        images_count: imagesCount,
      },
    };
  }
}
