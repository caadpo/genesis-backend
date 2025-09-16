// ome.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OmeEntity } from './entities/ome.entity';
import { CreateOmeDto } from './dtos/createOme.dto';
import { ReturnOmeDto } from './dtos/returnOme.dto';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { ReturnOmeComEventosDto } from './dtos/returnOmeComEventos.dto';

@Injectable()
export class OmeService {
  constructor(
    @InjectRepository(OmeEntity)
    private readonly omeRepository: Repository<OmeEntity>,
    @InjectRepository(PjesEventoEntity)
    private readonly eventoRepository: Repository<PjesEventoEntity>,
  ) {}

  async create(createOmeDto: CreateOmeDto): Promise<ReturnOmeDto> {
    const ome = this.omeRepository.create(createOmeDto);
    const saved = await this.omeRepository.save(ome);
    return new ReturnOmeDto(saved);
  }

  async findAll(): Promise<ReturnOmeDto[]> {
    const omes = await this.omeRepository.find({ relations: ['diretoria'] });
    return omes.map((ome) => new ReturnOmeDto(ome));
  }

  async findOne(id: number): Promise<ReturnOmeDto> {
    const ome = await this.omeRepository.findOne({
      where: { id },
      relations: ['diretoria'],
    });

    if (!ome) throw new NotFoundException(`OME com ID ${id} não encontrada.`);
    return new ReturnOmeDto(ome);
  }

  async buscarOmeIdComEventos(
    id: number,
    ano?: number,
    mes?: number,
    codVerba?: number,
  ): Promise<ReturnOmeComEventosDto> {
    // Busca a OME normalmente
    const ome = await this.omeRepository.findOne({
      where: { id },
    });
  
    if (!ome) {
      throw new NotFoundException(`OME com ID ${id} não encontrada.`);
    }
  
    // Busca os eventos com filtros
    const eventos = await this.omeRepository.manager.find(PjesEventoEntity, {
      where: {
        omeId: id,
        ...(ano ? { ano } : {}),
        ...(mes ? { mes } : {}),
        ...(codVerba ? { codVerba } : {}),
      },
      order: { createdAt: 'DESC' }, // opcional
    });
  
    // Retorna a OME com os eventos
    return new ReturnOmeComEventosDto({
      ...ome,
      eventos,
    });
  }

  // ome.service.ts
  async buscarTodosEventosComFiltros({
    ano,
    mes,
    codVerba,
  }: { ano: number; mes: number; codVerba?: number }) {
    return this.eventoRepository.find({
      where: {
        ano,
        mes,
        codVerba,
      },
      relations: ['ome'],
      order: {
        omeId: 'ASC',
      },
    });
  }
  
  async update(id: number, data: Partial<CreateOmeDto>): Promise<ReturnOmeDto> {
    const ome = await this.omeRepository.preload({ id, ...data });
    if (!ome) throw new NotFoundException(`OME com ID ${id} não encontrada.`);
    const updated = await this.omeRepository.save(ome);
    return this.findOne(updated.id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.omeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `OME com ID ${id} não encontrada para exclusão.`,
      );
    }
  }
}
