import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ImagesModule } from './images/images.module';
import { ModelsModule } from './models/models.module';
import { ConfigModule } from './config/config.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { FollowsModule } from './follows/follows.module';
import { LikesController } from './likes/likes.controller';
import { LikesService } from './likes/likes.service';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: 'RT_SECRET', // !!!
      signOptions: { expiresIn: '1d' },
    }),
    ImagesModule,
    ModelsModule,
    ConfigModule,
    UsersModule,
    FollowsModule,
    LikesModule,
    CommentsModule,
    TagsModule,
    NotificationsModule,
  ],
  controllers: [AppController, UsersController, LikesController],
  providers: [AppService, UsersService, LikesService],
})
export class AppModule {}
