/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { OptionalJwtAuthGuard } from './guards/users.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { userDirectoryPath } from '../common/utils/file-upload.utils';

@Controller('users')
export class UsersController {
  constructor(private readonly usersServive: UsersService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req) {
    return this.usersServive.findAll(req.user?.userid);
  }

  @Get('me/')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    try {
      return this.usersServive.getMe(req.user.username, req.user.userId);
    } catch (e: any) {
      throw new NotFoundException(e);
    }
  }

  @Patch('me/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const subFolder =
              file.fieldname === 'avatar' ? 'avatars' : 'banners';
            const folderHundler = userDirectoryPath(subFolder);
            void folderHundler(req, file, cb);
          },
        }),
      },
    ),
  )
  updateMe(
    @Body() dto: UpdateUserDto,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; banner?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    const avatarPath = files.avatar?.[0]?.path?.replace(/\\/g, '/');
    const bannerPath = files.banner?.[0]?.path?.replace(/\\/g, '/');
    return this.usersServive.update(req.user.userId, {
      ...dto,
      avatar: avatarPath,
      banner: bannerPath,
    });
  }

  @Get(':username/')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('username') username: string, @Req() req: any) {
    try {
      const currentUserId = req.user?.userId;
      return this.usersServive.findOne(username, currentUserId);
    } catch (e: any) {
      throw new NotFoundException(e);
    }
  }
}
