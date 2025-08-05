import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableDadosSgp1675770516772 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.dadossgp (
        id INTEGER PRIMARY KEY,
        matsgp INTEGER NOT NULL,
        pgsgp VARCHAR NOT NULL,
        ngsgp VARCHAR NOT NULL,
        nomecompletosgp VARCHAR NOT NULL,
        omesgp VARCHAR NOT NULL,
        tiposgp VARCHAR(1) NOT NULL,
        nunfuncsgp INTEGER NOT NULL,
        nunvincsgp INTEGER NOT NULL,
        localapresentacaosgp VARCHAR NOT NULL,
        situacaosgp VARCHAR NOT NULL,
        messgp INTEGER NOT NULL,
        anosgp INTEGER NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.dadossgp;
    `);
  }
}
