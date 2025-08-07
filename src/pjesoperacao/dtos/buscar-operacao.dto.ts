import { IsString, Matches } from 'class-validator';

export class BuscarOperacaoDto {
  @IsString()
  @Matches(/^\d+$/, {
    message: 'codOp must contain only numeric characters',
  })
  codOp: string;
}
