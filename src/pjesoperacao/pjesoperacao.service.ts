import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PjesOperacaoEntity } from './entities/pjesoperacao.entity';
import { CreatePjesOperacaoDto } from './dtos/create-pjesoperacao.dto';
import { ReturnPjesOperacaoDto } from './dtos/return-pjesoperacao.dto';
import { BadRequestException } from '@nestjs/common';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { UpdateStatusPjesOperacaoDto } from './dtos/update-status-pjesoperacao.dto';

import { Response } from 'express';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
type PDFDoc = InstanceType<typeof PDFDocument>; // 👈 Define o tipo correto do doc

@Injectable()
export class PjesOperacaoService {
  constructor(
    @InjectRepository(PjesEventoEntity)
    private readonly pjesEventoRepository: Repository<PjesEventoEntity>,

    @InjectRepository(PjesOperacaoEntity)
    private readonly pjesOperacaoRepository: Repository<PjesOperacaoEntity>,
  ) {}

  private async generateUniqueCodOp(mes: number, ano: number): Promise<string> {
    const sufixo = `${mes.toString().padStart(2, '0')}${ano}`;
    let codOp: string;
    let exists = true;

    while (exists) {
      const prefixo = Math.floor(10000 + Math.random() * 90000);
      codOp = `${prefixo}/${sufixo}`;
      const found = await this.pjesOperacaoRepository.findOne({
        where: { CodOp: codOp },
      });
      exists = !!found;
    }

    return codOp;
  }

  async create(
    dto: CreatePjesOperacaoDto,
    user: LoginPayload,
  ): Promise<ReturnPjesOperacaoDto> {
    // Carrega o evento relacionado
    const evento = await this.pjesOperacaoRepository.manager
      .getRepository(PjesEventoEntity)
      .findOne({
        where: { id: dto.pjesEventoId },
        relations: ['pjesoperacoes'],
      });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    // 🔒 Validação de permissão
    if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException('Evento homologado. Contate Adminitrador');
    }

    // Soma as distribuições já feitas
    const totalOficiaisDistribuidos =
      evento.pjesoperacoes?.reduce((sum, op) => sum + op.ttCtOfOper, 0) ?? 0;

    const totalPracasDistribuidos =
      evento.pjesoperacoes?.reduce((sum, op) => sum + op.ttCtPrcOper, 0) ?? 0;

    // Checa os limites
    if (totalOficiaisDistribuidos + dto.ttCtOfOper > evento.ttCtOfEvento) {
      throw new BadRequestException(
        `Uso das cotas de Oficiais excede o estabelecido pelo Evento`,
      );
    }

    if (totalPracasDistribuidos + dto.ttCtPrcOper > evento.ttCtPrcEvento) {
      throw new BadRequestException(
        `Uso das cotas das praças excede o estabelecido pelo Evento`,
      );
    }

    // Antes de salvar, gere o codOp
    const codOp = await this.generateUniqueCodOp(dto.mes, dto.ano);

    const entity = this.pjesOperacaoRepository.create({
      ...dto,
      codVerba: evento.codVerba,
      CodOp: codOp, // <-- aqui
    });

    const saved = await this.pjesOperacaoRepository.save(entity);

    // Recarrega com relação `ome` incluída
    const withRelations = await this.pjesOperacaoRepository.findOne({
      where: { id: saved.id },
      relations: ['ome'],
    });

    return new ReturnPjesOperacaoDto(withRelations);
  }

  async findAll(): Promise<ReturnPjesOperacaoDto[]> {
    const operations = await this.pjesOperacaoRepository.find({
      relations: [
        'ome',
        'pjesevento',
        'pjesescalas',
        'pjesescalas.comentarios',
        'pjesescalas.comentarios.autor',
        'pjesescalas.comentarios.autor.ome',
      ],
      order: { id: 'ASC' },
    });

    // Apenas mapear as operações para o DTO, sem modificar entidades internas
    return operations.map((op) => new ReturnPjesOperacaoDto(op));
  }

  async findOne(id: number): Promise<ReturnPjesOperacaoDto> {
    const operation = await this.pjesOperacaoRepository.findOne({
      where: { id },
      relations: [
        'pjesevento',
        'pjesescalas',
        'pjesescalas.comentarios',
        'pjesescalas.comentarios.autor',
        'pjesescalas.comentarios.autor.ome',
      ],
    });

    if (!operation) throw new NotFoundException('Operação não encontrada');

    // Retornar diretamente o DTO, que deve cuidar de converter comentários
    return new ReturnPjesOperacaoDto(operation);
  }

  async findByCodOp(CodOp: string): Promise<ReturnPjesOperacaoDto> {
    const operacao = await this.pjesOperacaoRepository.findOne({
      where: { CodOp }, // Note a capitalização correta conforme entidade
      relations: [
        'pjesescalas',
        'pjesescalas.comentarios',
        'pjesescalas.comentarios.autor',
        'pjesescalas.comentarios.autor.ome',
        'pjesevento',
        'ome',
        'pjesescalas.statusLogs',
      ],
    });

    if (!operacao) {
      throw new NotFoundException(
        `Operação com código ${CodOp} não encontrada`,
      );
    }

    return new ReturnPjesOperacaoDto(operacao);
  }

  async remove(id: number, user: LoginPayload): Promise<void> {
    const operation = await this.pjesOperacaoRepository.findOne({
      where: { id },
      relations: ['pjesevento', 'pjesescalas'], // atenção aqui: 'pjesescalas'
    });

    if (!operation) {
      throw new NotFoundException('Operação não encontrada');
    }

    const evento = await this.pjesEventoRepository.findOne({
      where: { id: operation.pjesEventoId },
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    // Impede exclusão se evento estiver homologado e o usuário não for do tipo 10
    if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Evento homologado. Exclusão não permitida.',
      );
    }

    // 🚫 Impede exclusão se houver escalas associadas e o usuário não for tipo 5 ou 10
    if (
      operation.pjesescalas &&
      operation.pjesescalas.length > 0 &&
      ![5, 10].includes(user.typeUser)
    ) {
      throw new BadRequestException(
        'Não é permitido excluir operações com policiais já escalados.',
      );
    }

    await this.pjesOperacaoRepository.remove(operation);
  }

  async updateStatusOperacao(
    id: number,
    dto: UpdateStatusPjesOperacaoDto,
    user: LoginPayload,
  ): Promise<ReturnPjesOperacaoDto> {
    const operacao = await this.pjesOperacaoRepository.findOne({
      where: { id },
      relations: ['pjesevento', 'ome'],
    });

    if (!operacao) {
      throw new NotFoundException('Operacao não encontrado');
    }

    const evento = operacao.pjesevento;

    if (!evento) {
      throw new NotFoundException('Distribuição do evento não encontrada');
    }

    if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Operacao pertencente a um evento homologado. Alteração não permitida.',
      );
    }

    operacao.statusOperacao = dto.statusOperacao;
    const saved = await this.pjesOperacaoRepository.save(operacao);

    return new ReturnPjesOperacaoDto(saved);
  }

  async update(
    id: number,
    dto: CreatePjesOperacaoDto,
    user: LoginPayload,
  ): Promise<ReturnPjesOperacaoDto> {
    const existing = await this.pjesOperacaoRepository.findOne({
      where: { id },
      relations: ['pjesevento'],
    });

    const evento = await this.pjesOperacaoRepository.manager
      .getRepository(PjesEventoEntity)
      .findOne({
        where: { id: existing.pjesevento.id },
        relations: ['pjesoperacoes'],
      });

    if (!evento) throw new NotFoundException('Evento não encontrado');

    if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Atualização inválida: Evento homologado. Contate o administrador.',
      );
    }

    // Soma das distribuições, exceto a atual
    const totalOficiaisDistribuidos = evento.pjesoperacoes
      .filter((op) => op.id !== id)
      .reduce((sum, op) => sum + op.ttCtOfOper, 0);

    const totalPracasDistribuidos = evento.pjesoperacoes
      .filter((op) => op.id !== id)
      .reduce((sum, op) => sum + op.ttCtPrcOper, 0);

    const novaSomaOficiais = totalOficiaisDistribuidos + dto.ttCtOfOper;
    const novaSomaPracas = totalPracasDistribuidos + dto.ttCtPrcOper;

    if (novaSomaOficiais > evento.ttCtOfEvento) {
      throw new BadRequestException(
        `Atualização inválida: Uso das cotas de Oficiais excede o estabelecido pelo Evento`,
      );
    }

    if (novaSomaPracas > evento.ttCtPrcEvento) {
      throw new BadRequestException(
        `Atualização inválida: Uso das cotas das Praças excede o estabelecido pelo Evento`,
      );
    }

    // Carrega as escalas da operação atual para validar o consumo real
    const operacaoExistente = await this.pjesOperacaoRepository.findOne({
      where: { id },
      relations: ['pjesescalas'],
    });

    if (!operacaoExistente) {
      throw new NotFoundException('Operação não encontrada');
    }

    // ✅ Impede troca de teto
    if (dto.pjesEventoId && dto.pjesEventoId !== existing.pjesEventoId) {
      throw new BadRequestException(
        'Não é permitido alterar o tipo da verba ja criada.',
      );
    }

    // Soma real de cotas consumidas já lançadas em escalas
    const cotasConsumidasOficiais = operacaoExistente.pjesescalas
      .filter((escala) => escala.tipoSgp?.toUpperCase() === 'O')
      .reduce((sum, escala) => sum + escala.ttCota, 0);

    const cotasConsumidasPracas = operacaoExistente.pjesescalas
      .filter((escala) => escala.tipoSgp?.toUpperCase() === 'P')
      .reduce((sum, escala) => sum + escala.ttCota, 0);

    // Valida se o novo valor é menor do que o já consumido
    if (dto.ttCtOfOper < cotasConsumidasOficiais) {
      throw new BadRequestException(
        `Não é possível reduzir cotas de Oficiais. Já foram consumidas nas escalas.`,
      );
    }

    if (dto.ttCtPrcOper < cotasConsumidasPracas) {
      throw new BadRequestException(
        `Não é possível reduzir cotas de Praças. Já foram consumidas nas escalas.`,
      );
    }

    // 🔒 Remove pjesEventoId para garantir que não será alterado
    delete dto.pjesEventoId;

    const updated = this.pjesOperacaoRepository.merge(existing, dto);
    const saved = await this.pjesOperacaoRepository.save(updated);
    //return new ReturnPjesOperacaoDto(saved);
    // Recarrega com relação `ome` incluída
    const withRelations = await this.pjesOperacaoRepository.findOne({
      where: { id: saved.id },
      relations: ['ome'],
    });

    return new ReturnPjesOperacaoDto(withRelations);
  }

  drawHeaderPageSyncWithImageBuffer(
    doc: InstanceType<typeof PDFDocument>,
    operacaoDto: any,
    CodOp: string,
    imageBuffer: Buffer | null,
  ) {
    if (imageBuffer) {
      try {
        doc.image(imageBuffer, (doc.page.width - 70) / 2, 30, { width: 70 });
        doc.y = 60;
      } catch (err) {
        console.warn('Erro ao inserir imagem do buffer:', err);
      }
    }

    doc.moveDown(1);
    doc.fontSize(12).font('Times-Bold').text('Secretaria de Defesa Social', {
      align: 'center',
    });
    doc.text('Policia Militar de Pernambuco', { align: 'center' });
    doc.text('Quartel do Comando Geral', { align: 'center' });
    doc.text('Diretoria de Planejamento Operacional', { align: 'center' });

    doc.moveDown(1);

    const y = doc.y;
    doc.fontSize(10).font('Times-Bold');
    doc.text(`OPERAÇÃO: ${operacaoDto.nomeOperacao}`, doc.page.margins.left, y);
    doc.text(`UNIDADE: ${operacaoDto.nomeOme || 'N/A'}`);
    doc.moveDown();
    doc
      .fontSize(12)
      .font('Times-Bold')
      .text('Programa de Jornada de Extra de Segurança (PJES):');

    const rightText = `CÓDIGO DA OPERAÇÃO: ${CodOp}`;
    const rightTextWidth = doc.widthOfString(rightText);
    doc
      .fontSize(10)
      .text(
        rightText,
        doc.page.width - doc.page.margins.right - rightTextWidth,
        y,
      );
    doc.text(`MES/ANO: ${operacaoDto.mes}/${operacaoDto.ano}`);

    doc.moveDown();
    doc.moveDown();
  }

  async exportPdfByCodOp(
    CodOp: string,
    res: Response,
    user: LoginPayload,
  ): Promise<void> {
    const operacaoDto = await this.findByCodOp(CodOp);

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 5,
    });

    doc.pipe(res);

    let currentPage = 1;

    // Função para desenhar rodapé (data e página)
    const addFooter = () => {
      const now = new Date();
      const dateString = now.toLocaleString('pt-BR');

      const footerY = doc.page.height - 40;
      const leftX = doc.page.margins.left;
      const rightX = doc.page.width - doc.page.margins.right - 100;

      doc.fontSize(9).fillColor('black');
      doc.text(
        `Documento gerado eletronicamente por ${user.loginSei} em: ${dateString}. A autenticidade pode ser conferida em www.genesis.pm.pe.gov.br, informando o COP: ${CodOp}   `,
        leftX,
        footerY,
        {
          align: 'left',
        },
      );
      doc.text(`Página ${currentPage}`, rightX, footerY, { align: 'right' });
    };

    // Atualiza contador de páginas e adiciona rodapé ao criar nova página
    doc.on('pageAdded', () => {
      currentPage++;

      this.drawHeaderPageSyncWithImageBuffer(
        doc,
        operacaoDto,
        CodOp,
        imageBuffer,
      );

      // 🔧 Correção: redefine a fonte e estilo de texto padrão após nova página
      doc.font('Times-Roman').fontSize(10).fillColor('black');

      addFooter();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Operacao-${CodOp}.pdf`,
    );

    const isDev = process.env.NODE_ENV !== 'production';

    const logoPath = isDev
      ? path.resolve('src', 'assets', 'govpe.png')
      : path.resolve(__dirname, 'assets', 'govpe.png');

    let imageBuffer: Buffer | null = null;

    try {
      imageBuffer = await fs.promises.readFile(logoPath);
    } catch (err) {
      console.warn('Erro ao carregar logo:', err);
    }

    // Agora que o logo foi carregado, PODE desenhar o header da primeira página
    this.drawHeaderPageSyncWithImageBuffer(
      doc,
      operacaoDto,
      CodOp,
      imageBuffer,
    );

    // Definições das colunas
    const rowHeight = 18;
    const colWidths = {
      index: 30,
      identificacao: 210,
      dataHorario: 130,
      local: 220,
      funcao: 50,
      anotacaoEscala: 190,
    };

    const headerBgColor = '#e0e0e0';
    const rowBgColor1 = '#f9f9f9';
    const rowBgColor2 = '#ffffff';
    const borderColor = '#cccccc';

    // Função para centralizar texto verticalmente na célula
    const centerTextY = (
      text: string,
      width: number,
      containerTop: number,
    ): number => {
      const textHeight = doc.heightOfString(text, { width });
      return containerTop + (rowHeight - textHeight) / 2;
    };

    // Função para desenhar o cabeçalho da tabela em determinada posição vertical
    const drawTableHeader = (startY: number) => {
      const x = doc.page.margins.left;
      doc.fontSize(9).font('Times-Bold');

      // Desenha retângulos do cabeçalho com cor de fundo e borda
      doc
        .rect(x, startY, colWidths.index, rowHeight)
        .fillAndStroke(headerBgColor, borderColor);
      doc
        .rect(x + colWidths.index, startY, colWidths.identificacao, rowHeight)
        .fillAndStroke(headerBgColor, borderColor);
      doc
        .rect(
          x + colWidths.index + colWidths.identificacao,
          startY,
          colWidths.dataHorario,
          rowHeight,
        )
        .fillAndStroke(headerBgColor, borderColor);
      doc
        .rect(
          x + colWidths.index + colWidths.identificacao + colWidths.dataHorario,
          startY,
          colWidths.local,
          rowHeight,
        )
        .fillAndStroke(headerBgColor, borderColor);
      doc
        .rect(
          x +
            colWidths.index +
            colWidths.identificacao +
            colWidths.dataHorario +
            colWidths.local,
          startY,
          colWidths.funcao,
          rowHeight,
        )
        .fillAndStroke(headerBgColor, borderColor);
      doc
        .rect(
          x +
            colWidths.index +
            colWidths.identificacao +
            colWidths.dataHorario +
            colWidths.local +
            colWidths.funcao,
          startY,
          colWidths.anotacaoEscala,
          rowHeight,
        )
        .fillAndStroke(headerBgColor, borderColor);

      doc.fillColor('black');

      doc.text('#', x + 5, centerTextY('#', colWidths.index - 10, startY), {
        width: colWidths.index - 10,
        align: 'left',
      });
      doc.text(
        'IDENTIFICAÇÃO DO POLICIAL',
        x + colWidths.index + 5,
        centerTextY(
          'IDENTIFICAÇÃO DO POLICIAL',
          colWidths.identificacao - 10,
          startY,
        ),
        { width: colWidths.identificacao - 10, align: 'left' },
      );
      doc.text(
        'DATA / HORÁRIO',
        x + colWidths.index + colWidths.identificacao + 5,
        centerTextY('DATA / HORÁRIO', colWidths.dataHorario - 10, startY),
        { width: colWidths.dataHorario - 10, align: 'left' },
      );
      doc.text(
        'LOCAL DE APRESENTAÇÃO',
        x +
          colWidths.index +
          colWidths.identificacao +
          colWidths.dataHorario +
          5,
        centerTextY('LOCAL DE APRESENTAÇÃO', colWidths.local - 10, startY),
        { width: colWidths.local - 10, align: 'left' },
      );
      doc.text(
        'FUNÇÃO',
        x +
          colWidths.index +
          colWidths.identificacao +
          colWidths.dataHorario +
          colWidths.local +
          5,
        centerTextY('FUNÇÃO', colWidths.funcao - 10, startY),
        { width: colWidths.funcao - 10, align: 'left' },
      );
      doc.text(
        'ANOTAÇÃO',
        x +
          colWidths.index +
          colWidths.identificacao +
          colWidths.dataHorario +
          colWidths.local +
          colWidths.funcao +
          5,
        centerTextY('ANOTAÇÃO', colWidths.anotacaoEscala - 10, startY),
        { width: colWidths.anotacaoEscala - 10, align: 'left' },
      );
    };

    // Começa a imprimir a tabela
    let currentY = doc.y;
    drawTableHeader(currentY);
    currentY += rowHeight;
    doc.font('Times-Roman');

    const registrosPorPagina = 15;
    const escalas = operacaoDto.pjesescalas || [];
    const startTableY = 170;

    addFooter();
    for (let i = 0; i < escalas.length; i++) {
      const escala = escalas[i];

      // Quebra de página a cada 20 registros
      if (i > 0 && i % registrosPorPagina === 0) {
        doc.addPage();
        currentY = startTableY;
        drawTableHeader(currentY);
        currentY += rowHeight;
      }

      doc.font('Times-Roman').fontSize(9).fillColor('black');

      const bgColor = i % 2 === 0 ? rowBgColor1 : rowBgColor2;
      const x = doc.page.margins.left;

      const identificacao = `${escala.pgSgp || ''} ${escala.matSgp || ''} ${
        escala.nomeGuerraSgp || ''
      } ${escala.omeSgp || ''}`;
      const dataInicio = new Date(
        escala.dataInicio + 'T03:00:00Z',
      ).toLocaleDateString('pt-BR');

      const dataHorario = `${dataInicio} ${escala.horaInicio || ''} às ${
        escala.horaFinal || ''
      }`;
      const local = escala.localApresentacaoSgp || '';
      const funcao = escala.funcao || '';
      const anotacao = escala.anotacaoEscala || '';

      // Desenha células
      doc
        .rect(x, currentY, colWidths.index, rowHeight)
        .fillAndStroke(bgColor, borderColor);
      doc
        .rect(x + colWidths.index, currentY, colWidths.identificacao, rowHeight)
        .fillAndStroke(bgColor, borderColor);
      doc
        .rect(
          x + colWidths.index + colWidths.identificacao,
          currentY,
          colWidths.dataHorario,
          rowHeight,
        )
        .fillAndStroke(bgColor, borderColor);
      doc
        .rect(
          x + colWidths.index + colWidths.identificacao + colWidths.dataHorario,
          currentY,
          colWidths.local,
          rowHeight,
        )
        .fillAndStroke(bgColor, borderColor);
      doc
        .rect(
          x +
            colWidths.index +
            colWidths.identificacao +
            colWidths.dataHorario +
            colWidths.local,
          currentY,
          colWidths.funcao,
          rowHeight,
        )
        .fillAndStroke(bgColor, borderColor);
      doc
        .rect(
          x +
            colWidths.index +
            colWidths.identificacao +
            colWidths.dataHorario +
            colWidths.local +
            colWidths.funcao,
          currentY,
          colWidths.anotacaoEscala,
          rowHeight,
        )
        .fillAndStroke(bgColor, borderColor);

      // Textos
      doc.fillColor('black').fontSize(9);
      doc.text(
        `${i + 1}`,
        x + 5,
        centerTextY(`${i + 1}`, colWidths.index, currentY),
        { width: colWidths.index - 10, align: 'left' },
      );
      doc.text(
        identificacao,
        x + colWidths.index + 5,
        centerTextY(identificacao, colWidths.identificacao, currentY),
        { width: colWidths.identificacao - 10, align: 'left' },
      );
      doc.text(
        dataHorario,
        x + colWidths.index + colWidths.identificacao + 5,
        centerTextY(dataHorario, colWidths.dataHorario, currentY),
        { width: colWidths.dataHorario - 10, align: 'left' },
      );
      doc.text(
        local,
        x +
          colWidths.index +
          colWidths.identificacao +
          colWidths.dataHorario +
          5,
        centerTextY(local, colWidths.local, currentY),
        { width: colWidths.local - 10, align: 'left' },
      );
      doc.text(
        funcao,
        x +
          colWidths.index +
          colWidths.identificacao +
          colWidths.dataHorario +
          colWidths.local +
          5,
        centerTextY(funcao, colWidths.funcao, currentY),
        { width: colWidths.funcao - 10, align: 'left' },
      );
      doc.text(
        anotacao,
        x +
          colWidths.index +
          colWidths.identificacao +
          colWidths.dataHorario +
          colWidths.local +
          colWidths.funcao +
          5,
        centerTextY(anotacao, colWidths.anotacaoEscala, currentY),
        { width: colWidths.anotacaoEscala - 10, align: 'left' },
      );

      currentY += rowHeight;
    }
    doc.end();
  }
}
