import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableOme1675388649811 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.ome (
        id SERIAL PRIMARY KEY,
        nomeOme VARCHAR NOT NULL,
        diretoriaid INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        CONSTRAINT fk_diretoria
          FOREIGN KEY (diretoriaid)
          REFERENCES public.diretoria(id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.ome;
    `);
  }
}
