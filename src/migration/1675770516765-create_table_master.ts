import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableMaster1675770516765 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'master_id_seq') THEN
          CREATE SEQUENCE public.master_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        END IF;
      END $$;

      CREATE TABLE public.master (
        id integer NOT NULL DEFAULT nextval('public.master_id_seq'),
        user_id integer NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now() NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE public.master;
      DROP SEQUENCE public.master_id_seq;
    `);
  }
}
