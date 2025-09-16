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
  Query
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
    @Query('mes') mes?: number,
    @Query('ano') ano?: number,
    @Query('codVerba') codVerba?: number,
  ) {
    return this.diretoriaService.findOne(id, mes, ano, codVerba);
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
