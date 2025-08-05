import { IsNumber } from 'class-validator';

export class UpdateMasterDTO {
  @IsNumber()
  userId: number;
}
