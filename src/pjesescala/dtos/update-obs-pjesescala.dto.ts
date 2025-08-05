import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateObsPjesEscalaDto {
  @IsString()
  @IsNotEmpty()
  obs: string;
}
