import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AuxiliarEntity } from './entities/auxiliar.entity';
import { CreateAuxiliarDTO } from './dtos/create-auxiliar.dto';
import { UpdateAuxiliarDTO } from './dtos/update-auxiliar.dto';

@Injectable()
export class AuxiliarService {
  constructor(
    @InjectRepository(AuxiliarEntity)
    private readonly auxiliarRepository: Repository<AuxiliarEntity>,
  ) {}

  async findAll(): Promise<AuxiliarEntity[]> {
    const auxiliars = await this.auxiliarRepository.find();

    if (!auxiliars || auxiliars.length === 0) {
      throw new NotFoundException('Nenhum auxiliar Encontrado');
    }

    return auxiliars;
  }

  async createAuxiliar(
    createAuxiliar: CreateAuxiliarDTO,
  ): Promise<AuxiliarEntity> {
    return this.auxiliarRepository.save({
      ...createAuxiliar,
    });
  }

  async findAuxiliarById(auxiliarId: number): Promise<AuxiliarEntity> {
    const auxiliar = await this.auxiliarRepository.findOne({
      where: {
        id: auxiliarId,
      },
    });

    if (!auxiliar) {
      throw new NotFoundException(`Auxiliar id: ${auxiliarId} Não Eontrado`);
    }

    return auxiliar;
  }

  async deleteAuxiliar(auxiliarId: number): Promise<DeleteResult> {
    await this.findAuxiliarById(auxiliarId);

    return this.auxiliarRepository.delete({ id: auxiliarId });
  }

  async updateAuxiliar(
    updateAuxiliar: UpdateAuxiliarDTO,
    auxiliarId: number,
  ): Promise<AuxiliarEntity> {
    const auxiliar = await this.findAuxiliarById(auxiliarId);

    return this.auxiliarRepository.save({
      ...auxiliar,
      ...updateAuxiliar,
    });
  }
}
