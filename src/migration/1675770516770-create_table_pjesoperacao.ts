import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTablePjesOperacao1675770516770
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.pjesoperacao (
        id SERIAL PRIMARY KEY,

        nomeoperacao VARCHAR NOT NULL,
        codverba INTEGER NOT NULL,
        pjeseventoid INTEGER NOT NULL,
        omeid INTEGER NOT NULL,

        ttctofoper INTEGER NOT NULL,
        ttctprcoper INTEGER NOT NULL,

        userid INTEGER NOT NULL,
        statusoperacao VARCHAR NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        codop VARCHAR NOT NULL UNIQUE,

        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),

        CONSTRAINT fk_pjesoperacao_pjeseventoid FOREIGN KEY (pjeseventoid)
          REFERENCES public.pjesevento(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesoperacao_omeid FOREIGN KEY (omeid)
          REFERENCES public.ome(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesoperacao_userid FOREIGN KEY (userid)
          REFERENCES public."user"(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.pjesoperacao;
    `);
  }
}
