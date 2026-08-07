import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleName } from '@/common/enums/role-name.enum';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateStyleDto } from '@/modules/styles/dto/create-style.dto';
import { StyleQueryDto } from '@/modules/styles/dto/style-query.dto';
import { UpdateStyleDto } from '@/modules/styles/dto/update-style.dto';
import { StylesService } from '@/modules/styles/styles.service';

@ApiTags('styles')
@Controller('styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  create(@Body() createStyleDto: CreateStyleDto) {
    return this.stylesService.create(createStyleDto);
  }

  @Get()
  findAll(@Query() query: StyleQueryDto) {
    return this.stylesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStyleDto: UpdateStyleDto) {
    return this.stylesService.update(id, updateStyleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.remove(id);
  }
}
