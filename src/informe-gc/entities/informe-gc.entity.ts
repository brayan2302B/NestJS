import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Actividad } from '../../actividades/entities/actividad.entity';

@Entity('informe_gc')
export class InformeGc {

  @PrimaryGeneratedColumn()
  id_gc: number;

  @Column({ type: 'varchar', length: 50 })
  version_gc: string;

  @Column({ type: 'int', nullable: true })
  fk_informe: number;

  @OneToMany(() => Actividad, (actividad) => actividad.informeGc)
  actividades: Actividad[];
}