// src/pjesevento/dtos/update-status-pjesevento.dto.ts
import { StatusEventoEnum } from 'src/utils/status-evento.enum';
import { IsEnum } from 'class-validator';

export class UpdateStatusPjesEventoDto {
  @IsEnum(StatusEventoEnum)
  statusEvento: StatusEventoEnum;
}
