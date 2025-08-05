import { PartialType } from '@nestjs/mapped-types';
import { CreatePjesEscalaDto } from './create-pjesescala.dto';

export class UpdatePjesEscalaDto extends PartialType(CreatePjesEscalaDto) {}
