import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  providers: [FollowsService, NotificationsService],
  controllers: [FollowsController],
})
export class FollowsModule {}
