/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('RT_SECRET');
    if (!secret) {
      throw new Error('RT_SECRET is not defined in ENV');
    }
    super({
      jwtFromRequest: (req: Request) => {
        return req?.body?.refresh || null;
      },
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.body.refresh;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing in body');
    }
    return { ...payload, refreshToken };
  }
}
