import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ColegiosService } from './colegios.service';
import { CreateColegioDto } from './dto/create-colegio.dto';
import { UpdateColegioDto } from './dto/update-colegio.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('colegios')
export class ColegiosController {
  constructor(private readonly colegiosService: ColegiosService) {}

  @Post()
  create(@Body() createColegioDto: CreateColegioDto) {
    return this.colegiosService.create(createColegioDto);
  }

  @Get()
  findAll() {
    return this.colegiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colegiosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColegioDto: UpdateColegioDto) {
    return this.colegiosService.update(+id, updateColegioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colegiosService.remove(+id);
  }
}
