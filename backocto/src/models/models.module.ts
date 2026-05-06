import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  providers: [ModelsService, NotificationsService],
  controllers: [ModelsController],
})
export class ModelsModule {}
