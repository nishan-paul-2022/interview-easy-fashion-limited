import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  styleId: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ type: [Number] })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      return value.split(',').map(Number);
    }
    return [Number(value)];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  sizeIds: number[];
}
