/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.notifService.findAll(req.user.userId);
  }

  @Patch(':id/')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: { is_read?: boolean },
  ) {
    return this.notifService.update(id, req.user.userId, {
      isRead: body.is_read,
    });
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  markAllRead(@Req() req: any) {
    return this.notifService.markAllRead(req.user.userId);
  }
}
