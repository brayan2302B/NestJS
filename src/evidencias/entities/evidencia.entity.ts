import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Actividad } from '../../actividades/entities/actividad.entity';

@Entity('evidencias')
export class Evidencia {

  @PrimaryGeneratedColumn()
  id_evidencia: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 255 })
  carpeta_obligacion: string;

  @Column({ type: 'varchar', length: 215 })
  fotografia: string;

  @ManyToOne(() => Actividad, (actividad) => actividad.evidencias, { nullable: true })
  @JoinColumn({ name: 'fk_actividades' })
  actividad: Actividad;
}