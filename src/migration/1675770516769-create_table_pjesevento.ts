import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTablePjesEvento1675770516769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.pjesevento (
        id SERIAL PRIMARY KEY,
        nomeevento VARCHAR NOT NULL,
        omeid INTEGER NOT NULL,
        pjesdistid INTEGER,
        codverba INTEGER NOT NULL,
        ttctofevento INTEGER NOT NULL,
        ttctprcevento INTEGER NOT NULL,
        regularouatrasado VARCHAR NOT NULL,
        userid INTEGER NOT NULL,
        statusevento VARCHAR NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),

        CONSTRAINT fk_pjesevento_ome FOREIGN KEY (omeid)
          REFERENCES public.ome(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesevento_user FOREIGN KEY (userid)
          REFERENCES public."user"(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesevento_pjesdist FOREIGN KEY (pjesdistid)
          REFERENCES public.pjesdist(id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.pjesevento;
    `);
  }
}
