// ome.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DiretoriaService } from './diretoria.service';
import { ReturnDiretoriaDto } from './dtos/returnDiretoria.dto';
import { CreateDiretoriaDto } from './dtos/createDiretoria.dto';

@Controller('diretoria')
export class DiretoriaController {
  constructor(private readonly diretoriaService: DiretoriaService) {}

  @Post()
  async create(
    @Body() createDiretoriaDto: CreateDiretoriaDto,
  ): Promise<ReturnDiretoriaDto> {
    return this.diretoriaService.create(createDiretoriaDto);
  }

  @Get()
  async findAll(): Promise<ReturnDiretoriaDto[]> {
    return this.diretoriaService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReturnDiretoriaDto> {
    return this.diretoriaService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDiretoriaDto: Partial<CreateDiretoriaDto>,
  ): Promise<ReturnDiretoriaDto> {
    return this.diretoriaService.update(id, createDiretoriaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.diretoriaService.remove(id);
  }
}
