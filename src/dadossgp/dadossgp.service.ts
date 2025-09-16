import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DadosSgpEntity } from './entities/dadossgp.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DadosSgpService {
  constructor(
    @InjectRepository(DadosSgpEntity)
    private readonly dadosSgpRepository: Repository<DadosSgpEntity>,
  ) {}

  /**
   * Busca os dados do policial para o mês/ano especificado.
   */
  async buscarPorMatricula(
    matSgp: number,
    mes: number,
    ano: number,
  ): Promise<DadosSgpEntity> {
    const dados = await this.dadosSgpRepository.findOne({
      where: { matSgp, mesSgp: mes, anoSgp: ano },
    });

    if (!dados) {
      throw new NotFoundException(
        `Policial ${matSgp} não encontrado para ${mes}/${ano}`,
      );
    }

    return dados;
  }

  /**
   * Busca o dado mais recente disponível do policial (último mês/ano registrado).
   */
  async buscarMaisRecentePorMatricula(
    matSgp: number,
  ): Promise<DadosSgpEntity> {
    const dado = await this.dadosSgpRepository.findOne({
      where: { matSgp },
      order: { anoSgp: 'DESC', mesSgp: 'DESC' },
    });

    if (!dado) {
      throw new NotFoundException(`Policial ${matSgp} não encontrado`);
    }

    return dado;
  }
}
