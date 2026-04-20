/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { ImagesService } from './images.service';
import {
  editFileName,
  userDirectoryPath,
} from '../common/utils/file-upload.utils';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getImages() {
    return this.imagesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: userDirectoryPath('images'),
        filename: editFileName,
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.imagesService.create(req.user.userId, file.path, req.body);
  }
}
