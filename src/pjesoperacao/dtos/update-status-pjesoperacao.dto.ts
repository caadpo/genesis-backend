import { IsEnum } from 'class-validator';
import { StatusOperacaoEnum } from 'src/utils/status-operacao.enum';

export class UpdateStatusPjesOperacaoDto {
  @IsEnum(StatusOperacaoEnum)
  statusOperacao: StatusOperacaoEnum;
}
