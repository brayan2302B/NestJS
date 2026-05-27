import { PartialType } from '@nestjs/mapped-types';
import { CreateVersioneDto } from './create-versione.dto';

export class UpdateVersioneDto extends PartialType(CreateVersioneDto) {}
