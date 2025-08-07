import {
  Body,
  Controller,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ReturnLogin } from './dtos/returnLogin.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UsePipes(ValidationPipe)
  @Post()
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any,
  ): Promise<ReturnLogin> {
    const user = req.user;
    console.log('Os dados do usaurio são: ', user);
    return this.authService.login(loginDto);
  }
}
