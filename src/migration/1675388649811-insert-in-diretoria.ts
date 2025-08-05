import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertInDiretoria1675388649811 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO public."diretoria" ("id", "nomediretoria", "dpoid")
      VALUES 
        (1,'DPO', 1),
        (2,'DIM', 1),
        (3,'DIRESP', 1),
        (4,'DINTER I', 1),
        (5,'DINTER II', 1),
        (6,'QCG', 1),
        (7,'OE', 1),
        (8,'DASDH', 1),
        (9,'MPPE', 1),
        (10,'TJPE', 1),
        (11,'CAMIL', 1),
        (12,'FEDERAL', 1),
        (13,'TIBRT', 1),
        (14,'TREPE', 1);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public."diretoria"
      WHERE nomediretoria IN (
        'DIM', 'DIRESP', 'DINTER I', 'DINTER II',
        'QCG', 'OE', 'DASDH', 'MPPE', 'TJPE', 'CAMIL', 'FEDERAL',
        'TIBRT', 'TREPE'
      );
    `);
  }
}
