import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ImagesModule } from './images/images.module';
import { ModelsModule } from './models/models.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FollowsModule } from './follows/follows.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommonModule } from './common/common.module';
import { ConfigModule as modelConfig } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('RT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ImagesModule,
    ModelsModule,
    UsersModule,
    FollowsModule,
    LikesModule,
    CommentsModule,
    TagsModule,
    NotificationsModule,
    CommonModule,
    modelConfig,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
