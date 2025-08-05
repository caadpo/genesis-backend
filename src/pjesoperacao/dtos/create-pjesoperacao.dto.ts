import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusOperacaoEnum } from 'src/utils/status-operacao.enum';

export class CreatePjesOperacaoDto {
  @IsString()
  @IsNotEmpty()
  nomeOperacao: string;

  @IsNumber()
  omeId: number;

  @IsNumber()
  pjesEventoId: number;

  @IsNumber()
  ttCtOfOper: number;

  @IsNumber()
  ttCtPrcOper: number;

  @IsNumber()
  userId: number;

  @IsEnum(StatusOperacaoEnum)
  statusOperacao: StatusOperacaoEnum;

  @IsNumber()
  mes: number;

  @IsNumber()
  ano: number;
}
