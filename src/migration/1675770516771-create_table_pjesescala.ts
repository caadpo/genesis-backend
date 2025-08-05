import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTablePjesEscala1675770516771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.pjesescala (
        id SERIAL PRIMARY KEY,
        pjeseventoid INTEGER NOT NULL,
        codverba INTEGER NOT NULL,
        pjesoperacaoid INTEGER NOT NULL,
        omeid INTEGER NOT NULL,

        pgsgp VARCHAR NOT NULL,
        matsgp INTEGER NOT NULL,
        ngsgp VARCHAR NOT NULL,
        nomecompletosgp VARCHAR NOT NULL,
        omesgp VARCHAR NOT NULL,
        tiposgp VARCHAR NOT NULL,
        nunfuncsgp INTEGER NOT NULL,
        nunvincsgp INTEGER NOT NULL,
        situacaosgp VARCHAR NOT NULL,

        datainicio DATE NOT NULL,
        datafinal DATE NOT NULL,
        horainicio TIME NOT NULL,
        horafinal TIME NOT NULL,

        phone VARCHAR,
        localapresentacaosgp VARCHAR,
        funcao VARCHAR,
        anotacaoescala VARCHAR,

        ttcota INTEGER NOT NULL,
        userid INTEGER NOT NULL,
        statusescala VARCHAR NOT NULL,
      
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),

        CONSTRAINT fk_pjesescala_pjeseventoid FOREIGN KEY (pjeseventoid)
          REFERENCES public.pjesevento(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesescala_pjesoperacaoid FOREIGN KEY (pjesoperacaoid)
          REFERENCES public.pjesoperacao(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesescala_omeid FOREIGN KEY (omeid)
          REFERENCES public.ome(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_pjesescala_userid FOREIGN KEY (userid)
          REFERENCES public."user"(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE

       
      );

      CREATE UNIQUE INDEX idx_mat_sgp_data_inicio ON public.pjesescala (matsgp, datainicio);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.pjesescala;
    `);
  }
}
