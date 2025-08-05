import { IsNumber } from 'class-validator';

export class CreateMasterDTO {
  @IsNumber()
  userId: number;
}
