import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { Rol } from '../../rol/entities/rol.entity';

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn()
  id_persona!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 18 })
  telefono!: string;

  @Column({ type: 'varchar', length: 100 })
  correo!: string;

  @Column({ type: 'varchar', length: 20 })
  documento!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash?: string;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'fk_area' })
  area?: Area;

  @ManyToOne(() => Rol, { nullable: true })
  @JoinColumn({ name: 'fk_rol' })
  rol?: Rol;
}