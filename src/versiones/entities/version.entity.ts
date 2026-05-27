import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('versiones')
export class Version {
  @PrimaryGeneratedColumn()
  id_version!: number;

  @Column({ type: 'int' })
  numero_version!: number;

  @Column({ type: 'date' })
  fecha_version!: Date;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @Column({ type: 'varchar', length: 50, default: 'activo' })
  estado!: string;
}
export class Versione {}
