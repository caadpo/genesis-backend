import { IsNumber } from 'class-validator';

export class CreateAuxiliarDTO {
  @IsNumber()
  userId: number;
}
