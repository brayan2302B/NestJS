import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class SeedInitialData1785500000000 implements MigrationInterface {
  name = 'SeedInitialData1785500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed Roles ('instructor', 'coordinador')
    const roles = await queryRunner.query(`SELECT "id_rol", "nombre_rol" FROM "roles"`);
    const roleNames = roles.map((r: any) => r.nombre_rol);

    if (!roleNames.includes('instructor')) {
      await queryRunner.query(
        `INSERT INTO "roles" ("nombre_rol", "created_at", "updated_at") VALUES ('instructor', NOW(), NOW())`,
      );
    }
    if (!roleNames.includes('coordinador')) {
      await queryRunner.query(
        `INSERT INTO "roles" ("nombre_rol", "created_at", "updated_at") VALUES ('coordinador', NOW(), NOW())`,
      );
    }

    // 2. Seed Areas ('Tecnologías de la Información')
    const areas = await queryRunner.query(`SELECT "id_area", "nombre_area" FROM "areas"`);
    const areaNames = areas.map((a: any) => a.nombre_area);

    if (!areaNames.includes('Tecnologías de la Información')) {
      await queryRunner.query(
        `INSERT INTO "areas" ("nombre_area", "created_at", "updated_at") VALUES ('Tecnologías de la Información', NOW(), NOW())`,
      );
    }

    // Fetch IDs for roles and area
    const instructorRoleRes = await queryRunner.query(
      `SELECT "id_rol" FROM "roles" WHERE "nombre_rol" = 'instructor' LIMIT 1`,
    );
    const coordinadorRoleRes = await queryRunner.query(
      `SELECT "id_rol" FROM "roles" WHERE "nombre_rol" = 'coordinador' LIMIT 1`,
    );
    const areaRes = await queryRunner.query(
      `SELECT "id_area" FROM "areas" WHERE "nombre_area" = 'Tecnologías de la Información' LIMIT 1`,
    );

    const instructorRoleId = instructorRoleRes[0]?.id_rol;
    const coordinadorRoleId = coordinadorRoleRes[0]?.id_rol;
    const areaId = areaRes[0]?.id_area;

    // 3. Seed Users (Juan Pérez, María García)
    const existingJuan = await queryRunner.query(
      `SELECT "id_usuario" FROM "usuarios" WHERE "numero_documento" = '123456' OR "correo" = 'juan.perez@sena.edu.co' LIMIT 1`,
    );
    if (existingJuan.length === 0) {
      const passInstructor = await bcrypt.hash('instructor123', 10);
      await queryRunner.query(
        `INSERT INTO "usuarios" 
        ("nombre_completo", "tipo_documento", "numero_documento", "correo", "contrasena_hash", "estado_cuenta", "id_rol", "id_area", "preferencias_notificaciones", "created_at", "updated_at")
        VALUES 
        ('Juan Pérez', 'CC', '123456', 'juan.perez@sena.edu.co', '${passInstructor}', 'aprobado', ${instructorRoleId}, ${areaId}, '{}', NOW(), NOW())`,
      );
    }

    const existingMaria = await queryRunner.query(
      `SELECT "id_usuario" FROM "usuarios" WHERE "numero_documento" = '654321' OR "correo" = 'maria.garcia@sena.edu.co' LIMIT 1`,
    );
    if (existingMaria.length === 0) {
      const passCoordinador = await bcrypt.hash('coordinador123', 10);
      await queryRunner.query(
        `INSERT INTO "usuarios" 
        ("nombre_completo", "tipo_documento", "numero_documento", "correo", "contrasena_hash", "estado_cuenta", "id_rol", "id_area", "preferencias_notificaciones", "created_at", "updated_at")
        VALUES 
        ('María García', 'CC', '654321', 'maria.garcia@sena.edu.co', '${passCoordinador}', 'aprobado', ${coordinadorRoleId}, ${areaId}, '{}', NOW(), NOW())`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "usuarios" WHERE "numero_documento" IN ('123456', '654321') AND "id_usuario" NOT IN (SELECT DISTINCT "id_usuario" FROM "contratos")`,
    );
  }
}
