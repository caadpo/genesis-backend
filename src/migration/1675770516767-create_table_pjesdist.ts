import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTablePjesDist1675770516767 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statusdist_enum') THEN
          CREATE TYPE statusdist_enum AS ENUM ('AUTORIZADA', 'HOMOLOGADA');
        END IF;
      END $$;

      CREATE TABLE public.pjesdist (
        id SERIAL PRIMARY KEY,
        nomedist VARCHAR NOT NULL,
        diretoriaid INTEGER NOT NULL,
        pjestetoid INTEGER NOT NULL,
        codverba INTEGER NOT NULL,
        ttctofdist INTEGER NOT NULL,
        ttctprcdist INTEGER NOT NULL,
        userid INTEGER NOT NULL,
        statusdist statusdist_enum NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        CONSTRAINT fk_diretoria FOREIGN KEY (diretoriaid)
          REFERENCES public.diretoria(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT fk_pjesteto FOREIGN KEY (pjestetoid)
          REFERENCES public.pjesteto(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT fk_user FOREIGN KEY (userid)
          REFERENCES public."user"(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.pjesdist;
      DROP TYPE IF EXISTS statusdist_enum;
    `);
  }
}
