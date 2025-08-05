import { IsNumber } from 'class-validator';

export class UpdateAuxiliarDTO {
  @IsNumber()
  userId: number;
}
