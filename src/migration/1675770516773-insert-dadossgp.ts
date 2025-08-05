import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertDadosSgp1675770516773 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO public.dadossgp (id,
        matsgp, pgsgp, ngsgp, nomecompletosgp, omesgp, tiposgp,
        nunfuncsgp, nunvincsgp, localapresentacaosgp, situacaosgp, messgp, anosgp
      ) VALUES
        -- Junho 2025
        (1, 1157590, 'CB', 'FRANCISCO', 'EMERSON FRANCISCO DA SILVA', 'DPO', 'P', 1234, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (2, 9601902, 'TC', 'JULIO AMERICO', 'JULIO AMERICO DE ARAUJO', 'DIM', 'O', 12365, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (3, 1085328, '3º SGT', 'FABIO', 'EMERSON FABIO DOS SANTOS', '18º BPM', 'P', 67890, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (4, 1078747, '1º SGT', 'DANIEL', 'BRUNO DANIEL SOUTO', '20º BPM', 'P', 4444, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (5, 1122860, 'CB', 'SHYRLANE', 'SHYRLANE MENDONÇA CAVALCANTI', 'DPO', 'P', 5678, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (6, 1000003, 'ST', 'FERREIRA', 'ANA FERREIRA', '6º BPM', 'P', 2345, 3, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (7, 1000004, '2º TEN', 'MARTINS', 'MARCOS MARTINS', '11º BPM', 'O', 3456, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (8, 1234567, 'CAP', 'ROCHA', 'PAULA ROCHA', '12º BPM', 'O', 6789, 2, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (9, 1000006, 'MAJ', 'LIMA', 'BRUNO LIMA', '13º BPM', 'O', 4567, 3, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (10, 1000007, 'SD', 'SANTOS', 'LUCAS SANTOS', '16º BPM', 'P', 1111, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (11, 1000008, 'CB', 'OLIVEIRA', 'RENATA OLIVEIRA', '17º BPM', 'P', 2222, 2, 'SEDE DA OME', 'IMPEDIDO - FÉRIAS', 6, 2025),
        (12, 1000009, 'ST', 'MORAES', 'TIAGO MORAES', '18º BPM', 'P', 3333, 3, 'SEDE DA OME', 'REGULAR', 6, 2025),
        (13, 1000010, '2º TEN', 'COSTA', 'PATRÍCIA COSTA', '19º BPM', 'O', 4444, 1, 'SEDE DA OME', 'REGULAR', 6, 2025),

         -- julho 2025
        (14, 1157590, 'CB', 'FRANCISCO', 'EMERSON FRANCISCO DA SILVA', 'DPO', 'P', 1234, 1, 'SEDE DA OME', 'IMPEDIDO - FÉRIAS', 7, 2025),
        (15, 9601902, 'TC', 'JULIO AMERICO', 'JULIO AMERICO DE ARAUJO', 'DIM', 'O', 12365, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (16, 1085328, '3º SGT', 'FABIO', 'EMERSON FABIO DOS SANTOS', '18º BPM', 'P', 67890, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (17, 1078747, '1º SGT', 'DANIEL', 'BRUNO DANIEL SOUTO', '20º BPM', 'P', 4444, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (18, 1000002, 'CB', 'SOUZA', 'CARLOS SOUZA', '1º BPM', 'P', 5678, 2, 'SEDE DA OME', 'IMPEDIDO', 7, 2025),
        (19, 1122860, 'CB', 'SHYRLANE', 'SHYRLANE MENDONÇA CAVALCANTI', 'DPO', 'P', 5678, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (20, 1000004, '2º TEN', 'MARTINS', 'MARCOS MARTINS', '11º BPM', 'O', 3456, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (21, 1234567, 'CAP', 'ROCHA', 'PAULA ROCHA', '12º BPM', 'O', 6789, 2, 'SEDE DA OME', 'IMPEDIDO - FÉRIAS', 7, 2025),
        (22, 1000006, 'MAJ', 'LIMA', 'BRUNO LIMA', '13º BPM', 'O', 4567, 3, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (23, 1000007, 'SD', 'SANTOS', 'LUCAS SANTOS', '16º BPM', 'P', 1111, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (24, 1000008, 'CB', 'OLIVEIRA', 'RENATA OLIVEIRA', '17º BPM', 'P', 2222, 2, 'SEDE DA OME', 'IMPEDIDO - FÉRIAS', 7, 2025),
        (25, 1000009, 'ST', 'MORAES', 'TIAGO MORAES', '18º BPM', 'P', 3333, 3, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (26, 1000010, '2º TEN', 'COSTA', 'PATRÍCIA COSTA', '19º BPM', 'O', 4444, 1, 'SEDE DA OME', 'REGULAR', 7, 2025),

         -- agosto 2025
        (27, 1157590, 'CB', 'FRANCISCO', 'EMERSON FRANCISCO DA SILVA', 'DPO', 'P', 1234, 1, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (28, 9601902, 'TC', 'JULIO AMERICO', 'JULIO AMERICO DE ARAUJO', 'DIM', 'O', 12365, 1, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (29, 1085328, '3º SGT', 'FABIO', 'EMERSON FABIO DOS SANTOS', '18º BPM', 'P', 67890, 1, 'SEDE DA OME', 'IMPEDIDO - LIC ESP', 8, 2025),
        (30, 1078747, '1º SGT', 'DANIEL', 'BRUNO DANIEL SOUTO', '20º BPM', 'P', 4444, 1, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (31, 1000002, 'CB', 'SOUZA', 'CARLOS SOUZA', '1º BPM', 'P', 5678, 2, 'SEDE DA OME', 'REGULAR', 7, 2025),
        (32, 1122860, 'CB', 'SHYRLANE', 'SHYRLANE MENDONÇA CAVALCANTI', 'DPO', 'P', 5678, 1, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (33, 1000004, '2º TEN', 'MARTINS', 'MARCOS MARTINS', '11º BPM', 'O', 3456, 1, 'SEDE DA OME', 'IMPEDIDO - FÉRIAS', 8, 2025),
        (34, 1234567, 'MAJ', 'ROCHA', 'PAULA ROCHA', '12º BPM', 'O', 6789, 2, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (35, 1000006, 'MAJ', 'LIMA', 'BRUNO LIMA', '13º BPM', 'O', 4567, 3, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (36, 1000007, 'SD', 'SANTOS', 'LUCAS SANTOS', '16º BPM', 'P', 1111, 1, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (37, 1000008, 'CB', 'OLIVEIRA', 'RENATA OLIVEIRA', '17º BPM', 'P', 2222, 2, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (38, 1000009, 'ST', 'MORAES', 'TIAGO MORAES', '18º BPM', 'P', 3333, 3, 'SEDE DA OME', 'REGULAR', 8, 2025),
        (39, 1000010, '2º TEN', 'COSTA', 'PATRÍCIA COSTA', '19º BPM', 'O', 4444, 1, 'SEDE DA OME', 'IMPEDIDO - FÉRIAS', 8, 2025);
       
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.dadossgp
      WHERE matsgp BETWEEN 1000001 AND 1000030;
    `);
  }
}
