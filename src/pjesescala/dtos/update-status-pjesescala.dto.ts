import { IsEnum } from 'class-validator';
import { StatusEscalaEnum } from 'src/utils/status-escala.enum';

export class UpdateStatusPjesEscalaDto {
  @IsEnum(StatusEscalaEnum)
  statusEscala: StatusEscalaEnum;
}
