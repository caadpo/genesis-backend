// dtos/returnOmeComEventos.dto.ts
import { ReturnOmeLoginDto } from './returnOmeLogin.dto';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';

export class ReturnOmeComEventosDto extends ReturnOmeLoginDto {
  eventos: PjesEventoEntity[];

  constructor(data: Partial<ReturnOmeComEventosDto>) {
    super(data);
    this.eventos = data.eventos || [];
  }
}
