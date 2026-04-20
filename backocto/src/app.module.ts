import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ImagesModule } from './images/images.module';
import { ModelsModule } from './models/models.module';
import { ConfigModule } from './config/config.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
