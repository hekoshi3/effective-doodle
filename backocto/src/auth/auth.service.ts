import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new ConflictException('This nickname or email is taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      include: { profile: true },
    });

    return {
      messsage: 'Registration success',
      userId: user.id,
    };
  }

  async login(dto: RegisterDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Uncorrect data');
    }

    //const payload = { sub: user.id, username: user.username };
    const tokens = this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, (await tokens).refresh_token);
    return {
      access_token: (await tokens).access_token,
      refresh_token: (await tokens).refresh_token, //access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getTokens(userId: number, username: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, username },
        { secret: 'AT_SECRET', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, username },
        { secret: 'RT_SECRET', expiresIn: '7d' },
      ),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRt)
      throw new ForbiddenException(
        'https://www.youtube.com/watch?v=2dZy3cd9KFY',
      );

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches)
      throw new ForbiddenException(
        'https://www.youtube.com/watch?v=2dZy3cd9KFY',
      );

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId, hashedRt: { not: null } },
      data: { hashedRt: null },
    });
  }
}
