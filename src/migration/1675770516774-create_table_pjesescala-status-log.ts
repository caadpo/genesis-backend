import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTablePjesEscalaStatusLog1675770516774
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.pjesescalastatuslog (
        id SERIAL PRIMARY KEY,
        escala_id INTEGER NOT NULL REFERENCES public.pjesescala(id) ON DELETE CASCADE,
        novo_status VARCHAR NOT NULL,
        user_id INTEGER NOT NULL,
        imagem_url VARCHAR,
        pg VARCHAR(10) NOT NULL,
        nome_guerra VARCHAR(100) NOT NULL,
        nome_ome VARCHAR(255) NOT NULL,
        data_alteracao TIMESTAMPTZ DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.pjesescalastatuslog;
    `);
  }
}
