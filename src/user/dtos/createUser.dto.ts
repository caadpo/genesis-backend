import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { UserType } from '../enum/user-type.enum';
import { Exclude } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  loginSei: string;

  @IsString()
  email: string;

  @IsOptional()
  password?: string;

  @IsString()
  pg: string;

  @IsNumber()
  mat: number;

  @IsString()
  nomeGuerra: string;

  @IsOptional()
  @IsString()
  tipo: string;

  @IsNumber()
  omeId: number;

  @IsString()
  phone: string;

  @IsString()
  funcao: string;

  @IsEnum(UserType)
  typeUser: UserType;
}
