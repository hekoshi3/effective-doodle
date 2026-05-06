import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { MulterModule } from '@nestjs/platform-express';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './media',
      }),
    }),
  ],
  providers: [ImagesService, NotificationsService],
  controllers: [ImagesController],
})
export class ImagesModule {}
