/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowUserDto } from './dto/follows.dto';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followService: FollowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggle(@Req() req: any, @Body() dto: FollowUserDto) {
    return this.followService.toggleFollow(req.user?.userId, dto.following);
  }
}
