import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PjesTetoEntity } from './entities/pjesteto.entity';
import { ReturnPjesTetoDto } from './dtos/return-pjesteto.dto';
import { CreatePjesTetoDto } from './dtos/create-pjesteto.dto';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';

@Injectable()
export class PjesTetoService {
  constructor(
    @InjectRepository(PjesTetoEntity)
    private readonly pjestetoRepository: Repository<PjesTetoEntity>,
  ) {}

  async create(dto: CreatePjesTetoDto): Promise<ReturnPjesTetoDto> {
    const entity = this.pjestetoRepository.create(dto);
    const saved = await this.pjestetoRepository.save(entity);
    return new ReturnPjesTetoDto(saved);
  }

  async findAll(ano?: number, mes?: number): Promise<ReturnPjesTetoDto[]> {
    const where: any = {};

    if (ano) where.ano = ano;
    if (mes) where.mes = mes;

    const items = await this.pjestetoRepository.find({
      where,
      relations: [
        'pjesdists',
        'pjesdists.diretoria',
        'pjesdists.pjeseventos',
        'pjesdists.pjeseventos.ome',
        'pjesdists.pjeseventos.pjesoperacoes',
        'pjesdists.pjeseventos.pjesoperacoes.pjesescalas',
        'pjesdists.pjeseventos.pjesoperacoes.pjesescalas.ome',
      ],
      order: {
        ano: 'ASC',
        mes: 'ASC',
      },
    });

    // Ordem personalizada para codverba
    const codverbaOrder = [
      247, 255, 263, 250, 252, 253, 260, 257, 251, 266, 999,
    ];

    const sortedItems = items.sort((a, b) => {
      const aIndex = codverbaOrder.indexOf(a.codVerba);
      const bIndex = codverbaOrder.indexOf(b.codVerba);

      // Se algum dos codverba não estiver na lista, envia pro final
      return (
        (aIndex === -1 ? codverbaOrder.length : aIndex) -
        (bIndex === -1 ? codverbaOrder.length : bIndex)
      );
    });

    return sortedItems.map((item) => new ReturnPjesTetoDto(item));
  }

  async findOne(id: number): Promise<ReturnPjesTetoDto> {
    const entity = await this.pjestetoRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('Pjesteto não encontrado');
    }
    return new ReturnPjesTetoDto(entity);
  }

  async update(id: number, dto: CreatePjesTetoDto): Promise<ReturnPjesTetoDto> {
    const entity = await this.pjestetoRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('Pjesteto não encontrado');
    }

    const now = new Date();

    const updatedEntity: Partial<PjesTetoEntity> = {
      ...entity,
      ...dto,
      updatedAt: now,
    };

    if (dto.statusTeto && dto.statusTeto !== entity.statusTeto) {
      updatedEntity.createdAtStatusTeto = now;
    }

    if (dto.statusPg && dto.statusPg !== entity.statusPg) {
      updatedEntity.createdAtStatusPg = now;
    }

    const saved = await this.pjestetoRepository.save(updatedEntity);
    return new ReturnPjesTetoDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.pjestetoRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('Pjesteto não encontrado');
    }
    await this.pjestetoRepository.remove(entity);
  }
}
