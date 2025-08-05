import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DadosSgpService } from './dadossgp.service';
import { DadosSgpEntity } from './entities/dadossgp.entity';

@Controller('dados-sgp')
export class DadosSgpController {
  constructor(private readonly dadosSgpService: DadosSgpService) {}

  @Get(':matSgp/:mes/:ano')
  async getDadosPorMatricula(
    @Param('matSgp', ParseIntPipe) matSgp: number,
    @Param('mes', ParseIntPipe) mes: number,
    @Param('ano', ParseIntPipe) ano: number,
  ): Promise<DadosSgpEntity> {
    return this.dadosSgpService.buscarPorMatricula(matSgp, mes, ano);
  }

  @Get(':matSgp/mais-recente')
  async getDadoMaisRecente(
    @Param('matSgp', ParseIntPipe) matSgp: number,
  ): Promise<DadosSgpEntity> {
    return this.dadosSgpService.buscarMaisRecentePorMatricula(matSgp);
  }
}
