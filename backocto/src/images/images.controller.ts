/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  ParseIntPipe,
  Patch,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { ImagesService } from './images.service';
import {
  editFileName,
  userDirectoryPath,
} from '../common/utils/file-upload.utils';
import { UpdateImageDto } from './dto/update-image.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getImages() {
    return this.imagesService.findAll();
  }

  @Get(':id/')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.findOne(id);
  }

  @Patch(':id/')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateImageDto,
  ) {
    return this.imagesService.update(id, req.user.userId, dto);
  }

  @Delete(':id/')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.imagesService.remove(id, req.user.userId);
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
