import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreatePjesTetoDto {
  @IsNotEmpty()
  nomeVerba: string;

  @IsNumber()
  codVerba: number;

  @IsNumber()
  tetoOf: number;

  @IsNumber()
  tetoPrc: number;

  @IsNumber()
  mes: number;

  @IsNumber()
  ano: number;

  @IsOptional()
  @IsIn(['ENVIADO', 'NAO ENVIADO'])
  statusTeto?: 'ENVIADO' | 'NAO ENVIADO';

  @IsOptional()
  @IsDateString()
  createdAtStatusTeto?: Date;

  @IsOptional()
  @IsIn(['PAGO', 'PENDENTE'])
  statusPg?: 'PAGO' | 'PENDENTE';

  @IsOptional()
  @IsDateString()
  createdAtStatusPg?: Date;
}
