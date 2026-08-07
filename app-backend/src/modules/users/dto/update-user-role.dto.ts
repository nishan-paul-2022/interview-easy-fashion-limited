import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleName } from '@/common/enums/role-name.enum';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: RoleName })
  @IsEnum(RoleName)
  @IsNotEmpty()
  role: RoleName;
}
