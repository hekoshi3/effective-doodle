import { Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  providers: [LikesService, NotificationsService],
  controllers: [LikesController],
})
export class LikesModule {}
