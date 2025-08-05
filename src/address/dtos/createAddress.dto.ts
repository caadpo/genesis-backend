import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString() //Precisa ser uma string
  @IsOptional() // É opcional escreve-lo
  complement: string;

  @IsInt()
  numberAddress: number;

  @IsString()
  cep: string;

  @IsInt()
  cityId: number;
}
