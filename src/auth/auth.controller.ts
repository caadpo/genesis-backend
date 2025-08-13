// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Response, Request } from 'express';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UsePipes(ValidationPipe)
  @Post()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.login(loginDto);

    // Define o cookie com o accessToken (HTTP-only e com expiração correta)
    res.cookie('accessToken', loginResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1h em milissegundos
    });

    // Retorna apenas os dados do usuário
    return {
      user: loginResult.user,
      accessToken: loginResult.accessToken, //adcionado pos erro
    };
  }
}
