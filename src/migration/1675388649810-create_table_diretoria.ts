import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableDiretoria1675388649810 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.diretoria (
        id SERIAL PRIMARY KEY,
        nomediretoria VARCHAR NOT NULL,
        dpoid INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.diretoria;
    `);
  }
}
