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
import { OmeService } from './ome.service';
import { ReturnOmeDto } from './dtos/returnOme.dto';
import { CreateOmeDto } from './dtos/createOme.dto';
import { Query } from '@nestjs/common';
import { ReturnOmeComEventosDto } from './dtos/returnOmeComEventos.dto';
import { FiltrosEventosDto } from './dtos/FiltrosEventosDto.dto';
import { ValidationPipe } from '@nestjs/common';


@Controller('ome')
export class OmeController {
  constructor(private readonly omeService: OmeService) {}

  @Get('/eventos')
  async buscarTodosEventosComFiltros(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    filtros: FiltrosEventosDto,
  ) {
    const ano = Number(filtros.ano);
    const mes = Number(filtros.mes);
    const codVerba = filtros.codVerba ? Number(filtros.codVerba) : undefined;
  
    return this.omeService.buscarTodosEventosComFiltros({ ano, mes, codVerba });
  }

  @Post()
  async create(@Body() dto: CreateOmeDto): Promise<ReturnOmeDto> {
    return this.omeService.create(dto);
  }

  @Get()
  async findAll(): Promise<ReturnOmeDto[]> {
    return this.omeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReturnOmeDto> {
    return this.omeService.findOne(id);
  }

  @Get(':id/eventos')
  async buscarOmeIdComEventos(
    @Param('id', ParseIntPipe) id: number,
    @Query('ano') ano?: number,
    @Query('mes') mes?: number,
    @Query('codVerba') codVerba?: number,
  ): Promise<ReturnOmeComEventosDto> {
    return this.omeService.buscarOmeIdComEventos(
      id,
      ano ? +ano : undefined,
      mes ? +mes : undefined,
      codVerba ? +codVerba : undefined,
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateOmeDto>,
  ): Promise<ReturnOmeDto> {
    return this.omeService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.omeService.remove(id);
  }
}
