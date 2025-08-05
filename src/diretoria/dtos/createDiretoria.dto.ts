import { IsString, IsNumber } from 'class-validator';

export class CreateDiretoriaDto {
  @IsString()
  nomeDiretoria: string;

  @IsNumber()
  dpoId: number;
}
