import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableDiretoria1675388649807 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.dpo (
        id SERIAL PRIMARY KEY,
        nomedpo VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.dpo;
    `);
  }
}
