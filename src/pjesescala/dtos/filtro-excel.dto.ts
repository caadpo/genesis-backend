import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class FiltroExcelDto {
  @Type(() => Number)
  @IsInt()
  mes: number;

  @Type(() => Number)
  @IsInt()
  ano: number;
}
