import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';

@Controller('') // auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('token/')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('token/refresh/')
  refreshTokens(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }
}
