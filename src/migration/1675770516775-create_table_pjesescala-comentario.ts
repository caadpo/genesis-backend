import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTablePjesEscalaComentario1675770516775
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.pjesescalacomentario (
        id SERIAL PRIMARY KEY,
        comentario TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        pjesescalaid INTEGER NOT NULL,
        userid INTEGER NOT NULL,

        CONSTRAINT fk_pjesescala_comentario_escala
          FOREIGN KEY (pjesescalaid)
          REFERENCES public.pjesescala(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_pjesescala_comentario_user
          FOREIGN KEY (userid)
          REFERENCES public."user"(id)
          ON DELETE NO ACTION
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.pjesescalacomentario;
    `);
  }
}
