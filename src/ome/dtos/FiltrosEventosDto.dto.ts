import { Transform } from 'class-transformer';
import { IsNumberString, IsOptional } from 'class-validator';

export class FiltrosEventosDto {
  @IsNumberString()
  ano: string;

  @IsNumberString()
  mes: string;

  @IsOptional()
  @IsNumberString()
  codVerba?: string;
}
