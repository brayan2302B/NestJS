import { PartialType } from '@nestjs/mapped-types';
import { CreateNovedadeDto } from './create-novedade.dto';

export class UpdateNovedadeDto extends PartialType(CreateNovedadeDto) {}
