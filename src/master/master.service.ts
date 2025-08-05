import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { MasterEntity } from './entities/master.entity';
import { CreateMasterDTO } from './dtos/create-master.dto';
import { UpdateMasterDTO } from './dtos/update-master.dto';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(MasterEntity)
    private readonly masterRepository: Repository<MasterEntity>,
  ) {}

  async findAll(): Promise<MasterEntity[]> {
    const masters = await this.masterRepository.find();

    if (!masters || masters.length === 0) {
      throw new NotFoundException('Nenhum Master Encontrado');
    }

    return masters;
  }

  async createMaster(createMaster: CreateMasterDTO): Promise<MasterEntity> {
    return this.masterRepository.save({
      ...createMaster,
    });
  }

  async findMasterById(masterId: number): Promise<MasterEntity> {
    const master = await this.masterRepository.findOne({
      where: {
        id: masterId,
      },
    });

    if (!master) {
      throw new NotFoundException(`Master id: ${masterId} Não Eontrado`);
    }

    return master;
  }

  async deleteMaster(masterId: number): Promise<DeleteResult> {
    await this.findMasterById(masterId);

    return this.masterRepository.delete({ id: masterId });
  }

  async updateMaster(
    updateMaster: UpdateMasterDTO,
    masterId: number,
  ): Promise<MasterEntity> {
    const master = await this.findMasterById(masterId);

    return this.masterRepository.save({
      ...master,
      ...updateMaster,
    });
  }
}
