import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertInDpo1675388649808 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO public."dpo"(nomedpo)
      VALUES 
        ('DPO');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public."dpo"
      WHERE nomedpo IN (
        'DPO'
      );
    `);
  }
}
