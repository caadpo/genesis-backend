import { IsString, IsNumber } from 'class-validator';

export class CreateDpoDto {
  @IsNumber()
  id: number;

  @IsString()
  nomeDpo: string;
}
