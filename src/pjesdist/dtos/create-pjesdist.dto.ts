import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusDistEnum } from 'src/utils/status-dist.enum';

export class CreatePjesDistDto {
  @IsString()
  @IsNotEmpty()
  nomeDist: string;

  @IsNumber()
  pjesTetoId: number;

  @IsNumber()
  diretoriaId: number;

  @IsNumber()
  ttCtOfDist: number;

  @IsNumber()
  ttCtPrcDist: number;

  @IsNumber()
  userId: number;

  @IsEnum(StatusDistEnum)
  statusDist: StatusDistEnum;

  @IsNumber()
  mes: number;

  @IsNumber()
  ano: number;
}
