import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertInPjesTeto1675388649810 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pjesteto("id", "imagem_url", "nomeverba", "codverba", "tetoof", "tetoprc", "mes", "ano") VALUES 
      (1, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 6, 2025),
      (2, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 6, 2025),
      (3, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 6, 2025),
      (4, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 6, 2025),
      (5, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 6, 2025),
      (6, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 6, 2025),
      (7, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 6, 2025),
      (8, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 6, 2025),
      (9, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 6, 2025),
      (10, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 6, 2025),
      (11, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 6, 2025),

      (12, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 7, 2025),
      (13, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 7, 2025),
      (14, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 7, 2025),
      (15, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 7, 2025),
      (16, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 7, 2025),
      (17, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 7, 2025),
      (18, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 7, 2025),
      (19, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 7, 2025),
      (20, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 7, 2025),
      (21, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 7, 2025),
      (22, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 7, 2025),

      (23, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 8, 2025),
      (24, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 8, 2025),
      (25, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 8, 2025),
      (26, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 8, 2025),
      (27, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 8, 2025),
      (28, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 8, 2025),
      (29, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 8, 2025),
      (30, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 8, 2025),
      (31, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 8, 2025),
      (32, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 8, 2025),
      (33, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 8, 2025),

      (34, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 9, 2025),
      (35, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 9, 2025),
      (36, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 9, 2025),
      (37, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 9, 2025),
      (38, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 9, 2025),
      (39, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 9, 2025),
      (40, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 9, 2025),
      (41, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 9, 2025),
      (42, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 9, 2025),
      (43, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 9, 2025),
      (44, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 9, 2025),

      (45, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 10, 2025),
      (46, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 10, 2025),
      (47, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 10, 2025),
      (48, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 10, 2025),
      (49, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 10, 2025),
      (50, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 10, 2025),
      (51, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 10, 2025),
      (52, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 10, 2025),
      (53, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 10, 2025),
      (54, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 10, 2025),
      (55, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 10, 2025),

      (56, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 11, 2025),
      (57, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 11, 2025),
      (58, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 11, 2025),
      (59, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 11, 2025),
      (60, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 11, 2025),
      (61, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 11, 2025),
      (62, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 11, 2025),
      (63, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 11, 2025),
      (64, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 11, 2025),
      (65, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 11, 2025),
      (66, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 11, 2025),

      (67, '/assets/images/dpo_logo.png', 'GOVERNO', 247, 10, 10, 12, 2025),
      (68, '/assets/images/pe_logo.png', 'PATRULHA ESCOLAR', 263, 10, 10, 12, 2025),
      (69, '/assets/images/mobi_logo.png', 'CTM BRT', 255, 10, 10, 12, 2025),
      (70, '/assets/images/alepe_logo.png', 'ALEPE', 251, 10, 10, 12, 2025),
      (71, '/assets/images/mppe_logo.jpg', 'MPPE', 253, 10, 10, 12, 2025),
      (72, '/assets/images/tjpe_logo.png', 'TJPE', 252, 10, 10, 12, 2025),
      (73, '/assets/images/camil_logo.jpg', 'CAMIL', 260, 10, 10, 12, 2025),
      (74, '/assets/images/brasil_logo.png', 'FEDERAL', 250, 10, 10, 12, 2025),
      (75, '/assets/images/sds_logo.png', 'OE', 999, 10, 10, 12, 2025),
      (76, '/assets/images/tce_logo.png', 'TCE', 266, 10, 10, 12, 2025),
      (77, '/assets/images/cprh_logo.jpg', 'CPRH', 257, 10, 10, 12, 2025)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.pjesteto;
    `);
  }
}
