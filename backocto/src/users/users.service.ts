import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../common/media/media.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

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
        avatar: this.mediaService.getAbsoluteUrl(u.profile!.avatar),
        banner: this.mediaService.getAbsoluteUrl(u.profile!.banner),
      },
      followers_count: u._count.followers,
      is_following: currentUserId ? u.followers.length > 0 : false,
    }));

    const _return = {
      count: results.length,
      next: null,
      previous: null,
      results,
    };

    return _return;
  }

  async findOne(username: string, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        _count: {
          select: { followers: true },
        },
        followers: currentUserId
          ? { where: { followerId: currentUserId } }
          : false,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const result = {
      id: user.id,
      username: user.username,
      profile: {
        username: user.username,
        bio: user.profile?.bio || '',
        avatar: this.mediaService.getAbsoluteUrl(user.profile!.avatar),
        banner: this.mediaService.getAbsoluteUrl(user.profile!.banner),
      },
      followers_count: user._count.followers,
      is_following: currentUserId ? user.followers.length > 0 : false,
    };

    return result;
  }

  async getMe(username: string, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
      },
    });

    //console.log(user);
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

    const _return = {
      id: user.id,
      username: user.username,
      first_name: '',
      last_name: '',
      bio: user.profile?.bio || '',
      avatar: this.mediaService.getAbsoluteUrl(user.profile!.avatar),
      banner: this.mediaService.getAbsoluteUrl(user.profile!.banner),
      stats: {
        total_downloads: downloadsAgg._sum.downloadsCount || 0,
        total_likes: totalLikes,
        followers: followersCount,
        models_count: modelsCount,
        images_count: imagesCount,
      },
    };

    //console.log(_return);

    return _return;
  }

  async update(
    user: number,
    data: {
      name?: string;
      bio?: string;
      avatar?: string;
      banner?: string;
    },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { id: user },
    });
    if (!existing) throw new NotFoundException();
    if (existing.id !== user)
      throw new ForbiddenException('You have no access to this object');

    const updated = await this.prisma.user.update({
      where: { id: existing.id },
      data: {
        profile: {
          update: {
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.avatar !== undefined && { avatar: data.avatar }),
            ...(data.banner !== undefined && { banner: data.banner }),
          },
        },
      },
      include: { profile: true },
    });
    return updated;
  }
}
