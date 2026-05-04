import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './media',
      }),
    }),
  ],
  providers: [ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}
