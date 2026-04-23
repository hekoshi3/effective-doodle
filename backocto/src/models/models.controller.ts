/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ModelsService } from './models.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  userDirectoryPath,
  editFileName,
} from '../common/utils/file-upload.utils';
import { UpdateModelDto } from './dto/update-model.dto';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async getModels() {
    return this.modelsService.findAll();
  }

  @Get(':id/')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modelsService.findOne(id);
  }

  @Patch(':id/')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateModelDto,
  ) {
    return this.modelsService.update(id, req.user.userId, dto);
  }

  @Delete(':id/')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.modelsService.remove(id, req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: userDirectoryPath('models'),
          filename: editFileName,
        }),
      },
    ),
  )
  async uploadImage(
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Body() dto: any,
    @Req() req,
  ) {
    const modelFile = files.file?.[0];
    const imageFile = files.image?.[0];

    if (!modelFile) {
      throw new BadRequestException('Model file is required');
    }
    return this.modelsService.create(
      req.user.userId,
      modelFile.path,
      req.body,
      imageFile?.path,
    );
  }

  @Get(':id/download/')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res) {
    const { url } = await this.modelsService.incrementDownload(id);
    return res.redirect(url);
  }
}

@Controller('config/model-types/')
export class ModelTypes {
  @Get()
  getModelTypes() {
    return [
      {
        value: 'LORA',
        label: 'LoRA',
      },
      {
        value: 'CHECKPOINT',
        label: 'Checkpoint',
      },
      {
        value: 'EMBEDDING',
        label: 'Embedding',
      },
      {
        value: 'UPSCALER',
        label: 'Upscaler',
      },
      {
        value: 'CONTROLNET',
        label: 'ControlNet',
      },
    ];
  }
}
