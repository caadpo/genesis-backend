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

  //ESSE METODO É PARA BUSCAR OS DADOS DO POLCIAL DENTRO DO MES PARA PREENCHER A ESCALA DE SERVICO
  async buscarPorMatricula(
    matSgp: number,
    mes: number,
    ano: number,
  ): Promise<DadosSgpEntity> {
    const dados = await this.dadosSgpRepository.findOneBy({
      matSgp,
      mesSgp: mes,
      anoSgp: ano,
    });

    if (!dados) {
      throw new NotFoundException(
        `Policial ${matSgp} não encontrado para ${mes}/${ano}`,
      );
    }

    return dados;
  }

  //ESSE METODDO É PARA PREENCHER OS CAMPOS COM OS DADOS MAIS RECENTE NA HORA DE CADASTRAR UM POLICIAL
  async buscarMaisRecentePorMatricula(matSgp: number): Promise<DadosSgpEntity> {
    const dado = await this.dadosSgpRepository.findOne({
      where: { matSgp },
      order: {
        anoSgp: 'DESC',
        mesSgp: 'DESC',
      },
    });

    if (!dado) {
      throw new NotFoundException(`Policial ${matSgp} não encontrado`);
    }

    return dado;
  }
}
