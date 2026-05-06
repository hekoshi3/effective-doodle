import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, NotificationsService],
})
export class CommentsModule {}
