import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaEntity } from '../entities/ca.entity';
import { CaService } from '../ca.service';
import { returnDeleteMock } from '../../__mocks__/return-delete.mock';
import { caMock } from '../__mocks__/ca.mock';
import { createCaMock } from '../__mocks__/create-ca.mock';

describe('CaService', () => {
  let service: CaService;
  let caRepository: Repository<CaEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({}).compile();

    service = module.get<CaService>(CaService);
    caRepository = module.get<Repository<CaEntity>>(
      getRepositoryToken(CaEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(caRepository).toBeDefined();
  });

  it('should return all Ca', async () => {
    const cas = await service.findAll();

    expect(cas).toEqual([caMock]);
  });

  it('should return error if Cas empty', async () => {
    jest.spyOn(caRepository, 'find').mockResolvedValue([]);

    expect(service.findAll()).rejects.toThrowError();
  });

  it('should return error in exception', async () => {
    jest.spyOn(caRepository, 'find').mockRejectedValue(new Error());

    expect(service.findAll()).rejects.toThrowError();
  });

  it('should return cas after insert in DB', async () => {
    const ca = await service.createCa(createCaMock);

    expect(ca).toEqual(caMock);
  });

  it('should return cas in find by id', async () => {
    const ca = await service.findCaById(caMock.id);

    expect(ca).toEqual(caMock);
  });

  it('should return error in cas not found', async () => {
    jest.spyOn(caRepository, 'findOne').mockResolvedValue(undefined);

    expect(service.findCaById(caMock.id)).rejects.toThrowError();
  });

  it('should return deleted true in delete Cas', async () => {
    const deleted = await service.deleteCa(caMock.id);

    expect(deleted).toEqual(returnDeleteMock);
  });

  it('should return Cas after update', async () => {
    const ca = await service.updateCa(createCaMock, caMock.id);

    expect(ca).toEqual(caMock);
  });

  it('should error in update Cas', async () => {
    jest.spyOn(caRepository, 'save').mockRejectedValue(new Error());

    expect(service.updateCa(createCaMock, caMock.id)).rejects.toThrowError();
  });
});
