/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { OptionalJwtAuthGuard } from './guards/users.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersServive: UsersService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req) {
    return this.usersServive.findAll(req.user?.userid);
  }

  @Get('me/')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    try {
      return this.usersServive.getMe(req.user.username, req.user.userId);
    } catch (e: any) {
      throw new NotFoundException(e);
    }
  }

  @Get(':username/')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('username') username: string, @Req() req: any) {
    try {
      const currentUserId = req.user?.userId;
      return this.usersServive.findOne(username, currentUserId);
    } catch (e: any) {
      throw new NotFoundException(e);
    }
  }
}
