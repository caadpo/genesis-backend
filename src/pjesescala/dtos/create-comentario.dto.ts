import { IsNotEmpty, IsString } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty()
  comentario: string;
}
