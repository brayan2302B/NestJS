import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id_rol!: number;

  @Column({ type: 'varchar', length: 50 })
  estado!: string;

  @Column({ default: false })
  inactivo!: boolean;

  @Column({ default: true })
  activo!: boolean;
}