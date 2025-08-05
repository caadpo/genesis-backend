import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusEventoEnum } from 'src/utils/status-evento.enum';

export class CreatePjesEventoDto {
  @IsString()
  @IsNotEmpty()
  nomeEvento: string;

  @IsNumber()
  pjesDistId: number;

  @IsNumber()
  omeId: number;

  @IsNumber()
  ttCtOfEvento: number;

  @IsNumber()
  ttCtPrcEvento: number;

  @IsString()
  regularOuAtrasado: string;

  @IsNumber()
  userId: number;

  @IsEnum(StatusEventoEnum)
  statusEvento: StatusEventoEnum;

  @IsNumber()
  mes: number;

  @IsNumber()
  ano: number;
}
