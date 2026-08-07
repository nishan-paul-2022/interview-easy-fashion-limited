import { PartialType } from '@nestjs/swagger';
import { CreateStyleDto } from '@/modules/styles/dto/create-style.dto';

export class UpdateStyleDto extends PartialType(CreateStyleDto) {}
