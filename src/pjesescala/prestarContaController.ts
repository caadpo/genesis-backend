import { Controller, Get, Query, Res } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Response } from 'express';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { PjesEscalaService } from './pjesescala.service';
import { UserType } from 'src/user/enum/user-type.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';

@Controller('prestarconta')
@Roles(UserType.Master, UserType.Auxiliar)
export class prestarContaController {
  constructor(private readonly service: PjesEscalaService) {}
  @Get('exportar')
  async exportarEscala(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
    @User() user: LoginPayload,
    @Res() res: Response,
  ) {
    return this.service.exportarParaExcel(mes, ano, user, res);
  }

  @Get('excel')
  async gerarExcel(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
    @Query('regularOuAtrasado') regularOuAtrasado: string, // 👈 Novo parâmetro
    @User() user: LoginPayload, // ✅ Aqui
    @Res() res: Response,
  ) {
    console.log(
      'mes:',
      mes,
      'ano:',
      ano,
      'regularOuAtrasado:',
      regularOuAtrasado,
    );
    return this.service.gerarExcel(mes, ano, regularOuAtrasado, user, res);
  }
}
